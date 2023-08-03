import { SessionManager } from "@puregram/session";
import { SceneManager } from "@puregram/scenes";
import * as scenes from '../scenes/index.js';
export const sessionManager = new SessionManager();
export const sceneManager = new SceneManager();
sceneManager.addScenes(Object.values(scenes));
console.log(Object.values(scenes));
