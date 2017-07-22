import React from 'react';
import { createStore } from 'redux';
import ToggleButton from './ToggleButton';
import rogueLikeReducer from '../reducers';

const Hammer = window.Hammer;

// 全局提示
let notifier = window.humane.create({
  baseCls: 'humane-jackedup',
  timeout: 5000,
});
notifier.error = notifier.spawn({ addnCls: 'humane-jackedup-error' });
notifier.success = notifier.spawn({ addnCls: 'humane-jackedup-success' });

let store = createStore(rogueLikeReducer);

// 游戏常量
const ATTACK_VARIANCE = 7;
const tileType = {
  WALL: 0,
  FLOOR: 1,
};
const reverseLookup = ['WALL', 'FLOOR'];
const weaponTypes = [
  {
    entityName: 'brass knuckles',
    entityType: 'weapon',
    health: 0,
    attack: 7,
  },
  {
    entityName: 'serrated dagger',
    entityType: 'weapon',
    health: 0,
    attack: 12,
  },
  {
    entityName: 'katana',
    entityType: 'weapon',
    health: 0,
    attack: 16,
  },
  {
    entityName: "reaper's scythe",
    entityType: 'weapon',
    health: 0,
    attack: 22,
  },
  {
    entityName: 'large trout',
    entityType: 'weapon',
    health: 0,
    attack: 30,
  },
];

const ENEMY = {
  health: 20,
  attack: 12,
  xp: 10,
};
const PLAYER = {
  baseHealth: 100,
  health: 20,
  attack: 12,
  toNextLevel: 60,
};

// Action Creators
function damage(entity, value) {
  store.dispatch({ type: 'DAMAGE', entityName: entity, value: value });
}
function heal(entity, health) {
  store.dispatch({ type: 'HEAL', entityName: entity, value: health });
}
function move(entity, vector) {
  store.dispatch({ type: 'MOVE', entityName: entity, vector: vector });
}
function setLocation(entity, location) {
  store.dispatch({
    type: 'SET_LOCATION',
    entityName: entity,
    location: location,
  });
}
function switchWeapon(weaponName, attack) {
  store.dispatch({ type: 'SWITCH_WEAPON', weapon: weaponName, attack: attack });
}
function addEntity(entityName, entityType, health, attack, location) {
  store.dispatch({
    type: 'ADD_ENTITY',
    entityName: entityName,
    entityType: entityType,
    health: health,
    attack: attack,
    location: location,
  });
}
function removeEntity(entityName) {
  store.dispatch({ type: 'REMOVE_ENTITY', entityName: entityName });
}
function resetBoard() {
  store.dispatch({ type: 'RESET_BOARD' });
}
function setMap(map) {
  store.dispatch({ type: 'SET_MAP', map: map });
}
function increaseLevel() {
  store.dispatch({ type: 'INCREASE_LEVEL' });
}
function setWindowSize() {
  store.dispatch({
    type: 'SET_WINDOW_SIZE',
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  });
}
function gainXp(xp) {
  store.dispatch({ type: 'GAIN_XP', xp: xp });
}
function levelUp(attack, health, xp) {
  store.dispatch({
    type: 'LEVEL_UP',
    attack: attack,
    health: health,
    toNextLevel: xp,
  });
}
function resetMap(map) {
  store.dispatch({ type: 'RESET_MAP', map: map });
}
function addBoss(attack, health, coords) {
  store.dispatch({
    type: 'ADD_BOSS',
    attack: attack,
    health: health,
    location: coords,
  });
}
function toggleDarkness() {
  store.dispatch({ type: 'TOGGLE_DARKNESS' });
}

export default class RogueLike extends React.Component {
  constructor(props) {
    super(props);
    this.state = this._select(store.getState());
  }

  componentWillMount() {
    this._setupGame();
  }
  componentDidMount() {
    this._storeDataChanged();
    this.unsubscribe = store.subscribe(this._storeDataChanged);
    window.addEventListener('keydown', this._handleKeypress);
    window.addEventListener('resize', setWindowSize);
    // 手势控制
    const touchElement = document.getElementById('root');
    const hammertime = new Hammer(touchElement);
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    hammertime.on('swipe', this._handleSwipe);
  }
  componentWillUnmount() {
    this.unsubscribe();
    window.removeEventListener('keydown', this._handleKeypress);
    window.removeEventListener('resize', setWindowSize);
  }
  _storeDataChanged = () => {
    const newState = store.getState();
    // 玩家是否升级
    if (newState.entities.player.toNextLevel <= 0) this._playerLeveledUp();
    this.setState(this._select(newState));
  };
  _select = state => {
    return {
      player: state.entities.player,
      entities: state.entities,
      map: state.map,
      occupiedSpaces: state.occupiedSpaces,
      level: state.level,
      windowHeight: state.windowHeight,
      windowWidth: state.windowWidth,
      darkness: state.darkness,
    };
  };
  _playerLeveledUp = () => {
    const currLevel = this.state.player.level + 1;
    levelUp(
      currLevel * PLAYER.attack,
      currLevel * PLAYER.health,
      (currLevel + 1) * PLAYER.toNextLevel,
    );
  };
  _setupGame = () => {
    resetMap(this.props.mapAlgo());
    this._fillMap();
    this._storeDataChanged();
    setWindowSize();
  };
  _getEmptyCoords = () => {
    const { map, occupiedSpaces } = store.getState();
    let coords, x, y;
    do {
      x = Math.floor(Math.random() * map.length);
      y = Math.floor(Math.random() * map[0].length);
      if (map[x][y] === tileType.FLOOR && !occupiedSpaces[x + 'x' + y]) {
        coords = { x: x, y: y };
      }
    } while (!coords);
    return coords;
  };
  _fillMap = () => {
    // 生成玩家
    setLocation('player', this._getEmptyCoords());
    // 生成武器
    const state = store.getState();
    const weapon = weaponTypes[state.level];
    addEntity(
      weapon.entityName,
      'weapon',
      weapon.health,
      weapon.attack,
      this._getEmptyCoords(),
    );
    // 生成药品和敌人
    const NUM_THINGS = 5, HEALTH_VAL = 20, LEVEL_MULT = state.level + 1;
    for (let i = 0; i < NUM_THINGS; i++) {
      addEntity('health' + i, 'health', HEALTH_VAL, 0, this._getEmptyCoords());
      addEntity(
        'enemy' + i,
        'enemy',
        LEVEL_MULT * ENEMY.health,
        LEVEL_MULT * ENEMY.attack,
        this._getEmptyCoords(),
      );
    }
    // 如果不是最后一层,则生成出口
    if (state.level < 4)
      addEntity('exit', 'exit', 0, 0, this._getEmptyCoords());
    // 在最后一层生成boss
    if (state.level === 4) addBoss(125, 500, this._getEmptyCoords());
  };
  _addVector = (coords, vector) => {
    return { x: coords.x + vector.x, y: coords.y + vector.y };
  };
  _toggleDarkness = () => {
    toggleDarkness();
  };
  _handleKeypress = e => {
    let vector = '';
    switch (e.keyCode) {
      case 37:
        vector = { x: -1, y: 0 };
        break;
      case 38:
        vector = { x: 0, y: -1 };
        break;
      case 39:
        vector = { x: 1, y: 0 };
        break;
      case 40:
        vector = { x: 0, y: 1 };
        break;
      default:
        vector = '';
        break;
    }
    if (vector) {
      e.preventDefault();
      this._handleMove(vector);
    }
  };
  _handleSwipe = e => {
    let vector;
    const { overallVelocity, angle } = e;
    if (Math.abs(overallVelocity) > 0.75) {
      // 向上滑动
      if (angle > -100 && angle < -80) {
        vector = { x: 0, y: -1 };
      }
      // 向右滑动
      if (angle > -10 && angle < 10) {
        vector = { x: 1, y: 0 };
      }
      // 向下滑动
      if (angle > 80 && angle < 100) {
        vector = { x: 0, y: 1 };
      }
      // 向左滑动
      if (Math.abs(angle) > 170) {
        vector = { x: -1, y: 0 };
      }
    }
    if (vector) {
      e.preventDefault();
      this._handleMove(vector);
    }
  };
  _handleMove = vector => {
    const state = store.getState();
    const player = state.entities.player;
    const map = state.map;
    const newCoords = this._addVector({ x: player.x, y: player.y }, vector);
    if (
      newCoords.x > 0 &&
      newCoords.y > 0 &&
      newCoords.x < map.length &&
      newCoords.y < map[0].length &&
      map[newCoords.x][newCoords.y] !== tileType.WALL
    ) {
      // 如果没碰到墙，判断是否有东西
      const entityName = state.occupiedSpaces[newCoords.x + 'x' + newCoords.y];
      // 如果是空的直接走上去
      if (!entityName) {
        move('player', vector);
        return;
      }
      // 对碰到的东西进行处理
      const entity = state.entities[entityName];
      switch (entity.entityType) {
        case 'weapon':
          switchWeapon(entityName, entity.attack);
          move('player', vector);
          break;
        case 'boss':
        case 'enemy':
          const playerAttack = Math.floor(
            Math.random() * ATTACK_VARIANCE + player.attack - ATTACK_VARIANCE,
          );
          const enemyAttack = Math.floor(
            Math.random() * ATTACK_VARIANCE + entity.attack - ATTACK_VARIANCE,
          );
          // 是否能够杀死敌人
          if (entity.health > playerAttack) {
            // 这一击是否可以杀死玩家
            if (enemyAttack > player.health) {
              notifier.error('你死了,下次好运!');
              this._setupGame();
              return;
            }
            damage(entityName, playerAttack);
            damage('player', enemyAttack);
          } else {
            // 判断敌人是否为boss
            if (entityName === 'boss') {
              notifier.success('你胜利了!');
              this._setupGame();
              return;
            }
            gainXp((state.level + 1) * ENEMY.xp);
            removeEntity(entityName);
          }
          break;
        case 'health':
          heal('player', entity.health);
          removeEntity(entityName);
          move('player', vector);
          break;
        case 'exit':
          resetBoard();
          setMap(this.props.mapAlgo());
          setLocation('player', this._getEmptyCoords());
          increaseLevel();
          this._fillMap();
          break;
        default:
          break;
      }
    }
  };

  render() {
    const {
      map,
      entities,
      occupiedSpaces,
      level,
      player,
      windowHeight,
      windowWidth,
      darkness,
    } = this.state,
      SIGHT = 7,
      // 必须与高和宽匹配
      tileSize = document.getElementsByClassName('tile').item(0)
        ? document.getElementsByClassName('tile').item(0).clientHeight
        : 10;

    // 获取当前视口的开始坐标
    const numCols = Math.floor(windowWidth / tileSize - 5),
      numRows = Math.floor(windowHeight / tileSize - 17);
    let startX = Math.floor(player.x - numCols / 2);
    let startY = Math.floor(player.y - numRows / 2);
    // 确保在界面内
    if (startX < 0) startX = 0;
    if (startY < 0) startY = 0;
    // 设置结束坐标
    let endX = startX + numCols;
    let endY = startY + numRows;
    // 验证开始和结束坐标
    if (endX > map.length) {
      startX = numCols > map.length ? 0 : startX - (endX - map.length);
      endX = map.length;
    }
    if (endY > map[0].length) {
      startY = numRows > map[0].length ? 0 : startY - (endY - map[0].length);
      endY = map[0].length;
    }

    // 创建可视区
    let rows = [], tileClass, row;
    for (let y = startY; y < endY; y++) {
      row = [];
      for (let x = startX; x < endX; x++) {
        let entity = occupiedSpaces[`${x}x${y}`];
        if (!entity) {
          tileClass = reverseLookup[map[x][y]];
        } else {
          tileClass = entities[entity].entityType;
        }
        if (darkness) {
          // 判断是否被迷雾覆盖
          const xDiff = player.x - x, yDiff = player.y - y;
          if (Math.abs(xDiff) > SIGHT || Math.abs(yDiff) > SIGHT) {
            tileClass += ' dark';
          } else if (
            Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2)) >= SIGHT
          ) {
            tileClass += ' dark';
          }
        }
        row.push(
          React.createElement(
            'span',
            { className: 'tile ' + tileClass, key: x + 'x' + y },
            ' ',
          ),
        );
      }
      rows.push(
        React.createElement(
          'div',
          { className: 'boardRow', key: 'row' + y },
          row,
        ),
      );
    }

    return (
      <div id="game">
        <ul id="ui">
          <li id="health">
            <span className="label">Health:</span> {player.health}
          </li>
          <li id="weapon">
            <span className="label">Weapon:</span> {player.weapon}
          </li>
          <li id="attack">
            <span className="label">Attack:</span> {player.attack}
          </li>
          <li id="playerLevel">
            <span className="label">Level:</span> {player.level}
          </li>
          <li id="xp">
            <span className="label">Next Level:</span> {player.toNextLevel} XP
          </li>
          <li id="level"><span className="label">Dungeon:</span> {level}</li>
        </ul>
        <div className="buttons">
          <ToggleButton
            label="Toggle Darkness"
            id="toggleDarkness"
            handleClick={this._toggleDarkness}
          />
        </div>
        <div id="board">
          {rows}
        </div>
      </div>
    );
  }
}
