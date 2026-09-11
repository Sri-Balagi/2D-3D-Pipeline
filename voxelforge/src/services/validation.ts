import type { SceneAction } from './commandInterpreter';

/**
 * Service to sanitize and validate AI-generated commands before executing on stores.
 * Protects against code injections, unwanted bulk removals, or out-of-bounds parameters.
 */
export const CommandValidationService = {
  validateAction(action: SceneAction): boolean {
    // 1. Check for valid action type
    const validTypes = [
      'SET_ENTITY_VISIBILITY',
      'SELECT_ENTITY',
      'HIGHLIGHT_LOW_CONFIDENCE',
      'SET_VISUALIZATION_MODE',
      'FOCUS_ENTITY',
      'EXPLODE_MODEL',
      'TRIGGER_SIMULATION'
    ];

    if (!validTypes.includes(action.type)) {
      console.error(`Validation Error: Unrecognized action type '${action.type}'`);
      return false;
    }

    // 2. Bound parameter limits
    if (action.type === 'EXPLODE_MODEL') {
      const factor = action.payload.factor;
      if (typeof factor !== 'number' || factor < 0 || factor > 5) {
        console.error(`Validation Error: Explosion factor '${factor}' out of bounds (0-5).`);
        return false;
      }
    }

    // 3. Prevent arbitrary deletions
    if (action.type === 'SET_ENTITY_VISIBILITY') {
      if (action.payload.target === undefined || action.payload.visible === undefined) {
        console.error('Validation Error: SET_ENTITY_VISIBILITY missing payload properties.');
        return false;
      }
    }

    return true;
  }
};
export default CommandValidationService;
