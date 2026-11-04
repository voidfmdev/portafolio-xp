import type { Character } from './Character'
import { FloppyCharacter } from './characters/FloppyCharacter'

/**
 * The assistant's character (D5), on the desktop and in Messenger (spec §5.6,
 * §5.7). Another character only has to meet the `Character` contract and go here.
 */
export const AssistantCharacter: Character = FloppyCharacter
