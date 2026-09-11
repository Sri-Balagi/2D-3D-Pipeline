# commandInterpreter.ts

``typescript
export type ActionType = 
  | 'SET_ENTITY_VISIBILITY'
  | 'SELECT_ENTITY'
  | 'HIGHLIGHT_LOW_CONFIDENCE'
  | 'SET_VISUALIZATION_MODE'
  | 'FOCUS_ENTITY'
  | 'EXPLODE_MODEL'
  | 'TRIGGER_SIMULATION';

export interface SceneAction {
  type: ActionType;
  payload: Record<string, any>;
}

/**
 * Service contract for natural language interpretation to structured scene operations.
 */
export const CommandInterpreterService = {
  /**
   * Translates natural language prompts to structured validated actions.
   */
  async interpretPrompt(prompt: string): Promise<SceneAction> {
    const text = prompt.toLowerCase();
    
    if (text.includes('hide')) {
      return {
        type: 'SET_ENTITY_VISIBILITY',
        payload: { target: 'windows', visible: false }
      };
    }
    if (text.includes('explode')) {
      return {
        type: 'EXPLODE_MODEL',
        payload: { factor: 1.5 }
      };
    }
    if (text.includes('simulation') || text.includes('play')) {
      return {
        type: 'TRIGGER_SIMULATION',
        payload: { action: 'play' }
      };
    }
    if (text.includes('holo')) {
      return {
        type: 'SET_VISUALIZATION_MODE',
        payload: { mode: 'holo' }
      };
    }
    
    throw new Error(`Command unrecognized by spatial parser: "${prompt}"`);
  }
};

``