const { sequelize } = require('../database');
const { LeakLog, RiskScore, Alert } = require('../index');

const SEVERITY_WEIGHTS = { Low: 5, Medium: 10, High: 20, Critical: 40 };

const getRiskLevel = (score) => {
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Medium';
  if (score <= 90) return 'High';
  return 'Critical';
};

const addLeakWithTransaction = async (data) => {
  const t = await sequelize.transaction();
  try {
    // STEP 1 — insert leak
    const leak = await LeakLog.create({
      user_id:       data.user_id,
      breach_id:     data.breach_id || null,
      date_detected: new Date(),
      data_type:     data.data_type,
      severity:      data.severity,
      notes:         data.notes || null,
    }, { transaction: t });

    // STEP 2 — update risk score
    const risk = await RiskScore.findOne({
      where: { user_id: data.user_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!risk) throw new Error('Risk score record not found for user');

    const increment   = SEVERITY_WEIGHTS[data.severity] || 5;
    const newScore    = Math.min(Number(risk.score) + increment, 100);
    const newLevel    = getRiskLevel(newScore);
    const levelChanged = newLevel !== risk.risk_level;

    await risk.update({
      score:        newScore,
      risk_level:   newLevel,
      leak_count:   risk.leak_count + 1,
      last_updated: new Date(),
      critical_data_exposed: risk.critical_data_exposed ||
        ['Aadhaar','PAN','Password','Multiple'].includes(data.data_type),
      calculation_details: JSON.stringify({
        previous_score: risk.score,
        increment,
        new_score: newScore,
        triggered_by: `${data.data_type} (${data.severity})`,
      }),
    }, { transaction: t });

    // STEP 3 — create alert
    const emoji = { Low:'🟡', Medium:'🟠', High:'🔴', Critical:'🚨' };
    const alert = await Alert.create({
      user_id:        data.user_id,
      date:           new Date(),
      message:        `${emoji[data.severity]} New ${data.severity} leak detected. Your ${data.data_type} data was found in a breach. Risk score updated to ${newScore}.`,
      status:         'Pending',
      alert_type:     'New Leak',
      related_log_id: leak.log_id,
    }, { transaction: t });

    if (levelChanged) {
      await Alert.create({
        user_id:    data.user_id,
        date:       new Date(),
        message:    `⚠️ Risk level upgraded from ${risk.risk_level} to ${newLevel}. Current score: ${newScore}.`,
        status:     'Pending',
        alert_type: 'Risk Update',
      }, { transaction: t });
    }

    await t.commit();
    return { leak, updatedRisk: { score: newScore, risk_level: newLevel, leak_count: risk.leak_count + 1 }, alert };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const getRiskTrend = async (userId) => {
  const leaks = await LeakLog.findAll({
    where: { user_id: userId },
    order: [['date_detected', 'ASC']],
    attributes: ['date_detected', 'severity'],
  });
  const weights = { Low:5, Medium:10, High:20, Critical:40 };
  const map = {};
  let cum = 0;
  leaks.forEach(l => {
    const d = new Date(l.date_detected);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    cum = Math.min(cum + (weights[l.severity] || 0), 100);
    map[key] = { month: key, label: d.toLocaleString('en-IN',{month:'short',year:'2-digit'}), score: cum };
  });
  return Object.values(map);
};

module.exports = { addLeakWithTransaction, getRiskLevel, getRiskTrend };
