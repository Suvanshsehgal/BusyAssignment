import { AppError } from '../../utils/appError.js';

export const APPLICATION_STAGES = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

export const FORWARD_STAGE_FLOW = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
];

export const NEXT_STAGE_MAP = {
  Applied: 'Screening',
  Screening: 'Interview',
  Interview: 'Offer',
  Offer: 'Hired',
};

/**
 * Validates and determines the next forward stage in the pipeline.
 * Rejects stage skipping (e.g. Applied -> Interview or Screening -> Offer) with 400 Bad Request.
 * Rejects advancing from Hired or Rejected with 400 Bad Request.
 *
 * @param {string} currentStage
 * @param {string} [requestedTargetStage]
 * @returns {string} The validated next stage
 */
export const determineNextStage = (currentStage, requestedTargetStage) => {
  if (currentStage === APPLICATION_STAGES.HIRED) {
    throw new AppError(
      'Candidate has already reached the final stage (Hired) and cannot advance further.',
      400
    );
  }

  if (currentStage === APPLICATION_STAGES.REJECTED) {
    throw new AppError(
      'Application is Rejected and cannot be advanced directly. Reinstate the candidate first.',
      400
    );
  }

  const validNextStage = NEXT_STAGE_MAP[currentStage];
  if (!validNextStage) {
    throw new AppError(`Invalid current stage: ${currentStage}`, 400);
  }

  // Reject any attempt by the client to skip stages
  if (requestedTargetStage && requestedTargetStage !== validNextStage) {
    throw new AppError(
      `Invalid stage transition from ${currentStage} to ${requestedTargetStage}. Stages must be progressed sequentially (${FORWARD_STAGE_FLOW.join(' → ')}).`,
      400
    );
  }

  return validNextStage;
};

/**
 * Validates whether an application can be rejected.
 * Rejects an already rejected candidate with 400 Bad Request.
 *
 * @param {string} currentStage
 */
export const validateRejection = (currentStage) => {
  if (currentStage === APPLICATION_STAGES.REJECTED) {
    throw new AppError('Candidate application is already in Rejected stage.', 400);
  }
};

/**
 * Validates whether a candidate application can be reinstated.
 * Rejects non-rejected candidates with 400 Bad Request.
 * Rejects applications missing rejectedFromStage.
 *
 * @param {object} application
 * @returns {string} The stage to reinstate to
 */
export const validateReinstatement = (application) => {
  if (application.stage !== APPLICATION_STAGES.REJECTED) {
    throw new AppError(
      `Only rejected applications can be reinstated. Current stage is '${application.stage}'.`,
      400
    );
  }

  if (!application.rejectedFromStage) {
    throw new AppError(
      'Cannot reinstate application: no prior stage recorded in rejected_from_stage.',
      400
    );
  }

  return application.rejectedFromStage;
};
