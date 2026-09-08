import * as panelsService from './panels.service.js';

export const assignPanel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const panel = await panelsService.assignPanel(id, req.body, req.user?.id);

    res.status(201).json({
      status: 'success',
      data: { panel },
    });
  } catch (error) {
    next(error);
  }
};

export const getPanel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const panel = await panelsService.getPanel(id);

    res.status(200).json({
      status: 'success',
      results: panel.length,
      data: { panel },
    });
  } catch (error) {
    next(error);
  }
};

export const removePanelMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    await panelsService.removePanelMember(id, userId, req.user?.id);

    res.status(200).json({
      status: 'success',
      message: 'Interviewer removed from panel successfully.',
    });
  } catch (error) {
    next(error);
  }
};
