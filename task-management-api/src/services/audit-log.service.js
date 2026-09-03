const { AuditLog } = require('../models');

const createAuditLog = async ({
  userId,
  action,
  requestPayload,
  responsePayload,
  status,
  failedReason = null,
}) => {
  return AuditLog.create({
    userId,
    action,
    requestPayload,
    responsePayload,
    status,
    failedReason,
  });
};

module.exports = {
  createAuditLog,
};