const _ = window._;

const initialState = {
  entities: {
    player: {
      entityType: 'player',
      x: 0,
      y: 0,
      health: 100,
      inventory: {},
      weapon: 'stick',
      attack: 7,
      level: 0,
      toNextLevel: 60,
    },
  },
  occupiedSpaces: {
    '0x0': 'player',
  },
  map: [],
  level: 0,
  windowHeight: 500,
  windowWidth: 500,
  darkness: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'DAMAGE':
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.entityName]: {
            ...state.entities[action.entityName],
            health: state.entities[action.entityName].health - action.value,
          },
        },
      };
    case 'HEAL':
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.entityName]: {
            ...state.entities[action.entityName],
            health: state.entities.player.health + action.value,
          },
        },
      };
    case 'SWITCH_WEAPON':
      return {
        ...state,
        entities: {
          ...state.entities,
          player: {
            ...state.entities.player,
            weapon: action.weapon,
            attack: state.entities.player.attack + action.attack,
          },
        },
      };
    case 'MOVE':
      return {
        ...state,
        occupiedSpaces: _.chain(state.occupiedSpaces)
          .omit(
            `${state.entities[action.entityName].x}x${state.entities[action.entityName].y}`,
          )
          .set(
            `${state.entities[action.entityName].x + action.vector.x}x${state.entities[action.entityName].y + action.vector.y}`,
            action.entityName,
          )
          .value(),
        entities: {
          ...state.entities,
          [action.entityName]: {
            ...state.entities[action.entityName],
            x: state.entities[action.entityName].x + action.vector.x,
            y: state.entities[action.entityName].y + action.vector.y,
          },
        },
      };
    case 'SET_LOCATION':
      return {
        ...state,
        occupiedSpaces: _.chain(state.occupiedSpaces)
          .omit(
            `${state.entities[action.entityName].x}x${state.entities[action.entityName].y}`,
          )
          .set(`${action.location.x}x${action.location.y}`, action.entityName)
          .value(),
        entities: {
          ...state.entities,
          [action.entityName]: {
            ...state.entities[action.entityName],
            x: action.location.x,
            y: action.location.y,
          },
        },
      };
    case 'ADD_ENTITY':
      return {
        ...state,
        occupiedSpaces: {
          ...state.occupiedSpaces,
          [`${action.location.x}x${action.location.y}`]: action.entityName,
        },
        entities: {
          ...state.entities,
          [action.entityName]: {
            entityType: action.entityType,
            health: action.health,
            attack: action.attack,
            x: action.location.x,
            y: action.location.y,
          },
        },
      };
    case 'REMOVE_ENTITY':
      return {
        ...state,
        occupiedSpaces: _.chain(state.occupiedSpaces)
          .omit(
            `${state.entities[action.entityName].x}x${state.entities[action.entityName].y}`,
          )
          .value(),
        entities: _.chain(state.entities).omit(action.entityName).value(),
      };
    case 'RESET_BOARD':
      return {
        ...state,
        entities: {
          player: state.entities.player,
        },
        occupiedSpaces: {
          [`${state.entities.player.x}x${state.entities.player.y}`]: 'player',
        },
      };
    case 'SET_MAP':
      return {
        ...state,
        map: action.map,
      };
    case 'INCREASE_LEVEL':
      return {
        ...state,
        level: state.level + 1,
      };
    case 'RESET_LEVEL':
      return {
        ...state,
        level: 0,
      };
    case 'SET_WINDOW_SIZE':
      return {
        ...state,
        windowHeight: action.windowHeight,
        windowWidth: action.windowWidth,
      };
    case 'GAIN_XP':
      return {
        ...state,
        entities: {
          ...state.entities,
          player: {
            ...state.entities.player,
            toNextLevel: state.entities.player.toNextLevel - action.xp,
          },
        },
      };
    case 'LEVEL_UP':
      return {
        ...state,
        entities: {
          ...state.entities,
          player: {
            ...state.entities.player,
            attack: state.entities.player.attack + action.attack,
            health: state.entities.player.health + action.health,
            toNextLevel: action.toNextLevel,
            level: state.entities.player.level + 1,
          },
        },
      };
    case 'RESET_MAP':
      return {
        ...initialState,
        map: action.map,
      };
    case 'ADD_BOSS':
      return {
        ...state,
        occupiedSpaces: {
          ...state.occupiedSpaces,
          [`${action.location.x}x${action.location.y}`]: 'boss',
          [`${action.location.x + 1}x${action.location.y}`]: 'boss',
          [`${action.location.x}x${action.location.y + 1}`]: 'boss',
          [`${action.location.x + 1}x${action.location.y + 1}`]: 'boss',
        },
        entities: {
          ...state.entities,
          boss: {
            entityType: 'enemy',
            health: action.health,
            attack: action.attack,
            x: action.location.x,
            y: action.location.y,
          },
        },
      };
    case 'TOGGLE_DARKNESS':
      return {
        ...state,
        darkness: !state.darkness,
      };
    default:
      return state;
  }
};
