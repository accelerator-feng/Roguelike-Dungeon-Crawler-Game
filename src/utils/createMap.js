const tileType = {
  WALL: 0,
  FLOOR: 1,
};

// 生成一个包含指定房间数的矩阵，其中0为墙，1为地板
export default function createMap(
  width = 100,
  height = 100,
  maxRoomSize = 20,
  minRoomSize = 6,
  numRooms = 20,
) {
  // 初始化网格
  let map = new Array(width).fill(0);
  const blankCol = new Array(height).fill(tileType.WALL);
  map = map.map(() => blankCol.slice());

  // 创建第一个房间
  fillRect(map, { x: 45, y: 45 }, { x: 10, y: 10 }, tileType.FLOOR);

  // 创建所有房间
  for (let i = 0; i < numRooms; i++) {
    placeRoom(map);
  }

  return map;

  function fillRect(map, startCoord, size, fillVal) {
    for (let i = startCoord.x; i < startCoord.x + size.x; i++) {
      map[i].fill(fillVal, startCoord.y, size.y + startCoord.y);
    }
    return map;
  }

  // 创建随机地点的房间
  function placeRoom(map) {
    let wall, width, height, startX, startY, coords, numClear;
    while (true) {
      numClear = 0;
      wall = findWall(map);
      coords = wall.coords;
      width = Math.floor(
        Math.random() * (maxRoomSize - minRoomSize) + minRoomSize,
      );
      height = Math.floor(
        Math.random() * (maxRoomSize - minRoomSize) + minRoomSize,
      );
      switch (wall.openDir) {
        case 'right':
          startX = coords.x - width;
          startY = coords.y - Math.floor(height / 2) + getDoorOffset(height);
          break;
        case 'left':
          startX = coords.x + 1;
          startY = coords.y - Math.floor(height / 2) + getDoorOffset(height);
          break;
        case 'top':
          startX = coords.x - Math.floor(width / 2) + getDoorOffset(width);
          startY = coords.y + 1;
          break;
        case 'bottom':
          startX = coords.x - Math.floor(width / 2) + getDoorOffset(width);
          startY = coords.y - height;
          break;
        default:
          break;
      }
      // 如果在矩阵外则退出循环
      if (
        startX < 0 ||
        startY < 0 ||
        startX + width >= map.length ||
        startY + height >= map[0].length
      ) {
        continue;
      }
      // 检测是否会和其他房间冲突
      for (let i = startX; i < startX + width; i++) {
        if (
          map[i]
            .slice(startY, startY + height)
            .every(tile => tile === tileType.WALL)
        ) {
          numClear++;
        }
      }
      if (numClear === width) {
        fillRect(
          map,
          { x: startX, y: startY },
          { x: width, y: height },
          tileType.FLOOR,
        );
        map[coords.x][coords.y] = 1;
        return map;
      }
    }

    function getDoorOffset(length) {
      return Math.floor(Math.random() * length - Math.floor((length - 1) / 2));
    }
  }

  function findWall(map) {
    const coords = { x: 0, y: 0 };
    let wallDir = false;
    do {
      coords.x = Math.floor(Math.random() * map.length);
      coords.y = Math.floor(Math.random() * map[0].length);
      wallDir = isWall(map, coords);
    } while (!wallDir);

    return { coords: coords, openDir: wallDir };
  }

  // 如果是墙则返回墙的朝向
  function isWall(map, coords) {
    if (map[coords.x][coords.y] !== tileType.WALL) {
      return false;
    }
    if (
      typeof map[coords.x - 1] !== 'undefined' &&
      map[coords.x - 1][coords.y] === tileType.FLOOR
    ) {
      return 'left';
    }
    if (
      typeof map[coords.x + 1] !== 'undefined' &&
      map[coords.x + 1][coords.y] === tileType.FLOOR
    ) {
      return 'right';
    }
    if (map[coords.x][coords.y - 1] === tileType.FLOOR) {
      return 'top';
    }
    if (map[coords.x][coords.y + 1] === tileType.FLOOR) {
      return 'bottom';
    }
    return false;
  }
}
