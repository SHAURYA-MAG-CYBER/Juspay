import React, { useState } from "react";
import "./index.css";

const movements = [
  { type: "move", label: "Move", inputs: ["steps"] },
  { type: "turn", label: "Turn", inputs: ["degrees"] },
  { type: "goTo", label: "Go to", inputs: ["x", "y"] },
  { type: "repeat", label: "Repeat", inputs: ["times"], isContainer: true },
];

const looks = [
  { type: "speak", label: "Speak", inputs: ["text", "time"] },
  { type: "think", label: "Think", inputs: ["text", "time"] }
];

const availableItems = [
  { id: 1, name: "Cat", emoji: "🐱", position: { top: 200, left: 600 }, blocks:[], angle:0 },
  { id: 2, name: "Dog", emoji: "🐶", position: {} },
  { id: 3, name: "Fox", emoji: "🦊", position: {} },
  { id: 4, name: "Rabbit", emoji: "🐰", position: {} }
];


function ActionsTab() {
  return (
    <div className="p-4 bg-blue-50 w-60">
      <h2 className="font-bold mb-2">Actions</h2>
      {movements.map((block) => (
        <div
          key={block.type}
          draggable
          onDragStart={(e) =>
            e.dataTransfer.setData("blockType", JSON.stringify(block))
          }
          className="bg-blue-200 p-2 m-1 rounded cursor-move"
        >
          {block.label} {block.inputs.map((input) => `__${input}__`).join(" ")}
        </div>
      ))}
      <h2 className="font-bold mb-2">Looks</h2>
      {looks.map((block) => (
        <div
          key={block.type}
          draggable
          onDragStart={(e) =>
            e.dataTransfer.setData("blockType", JSON.stringify(block))
          }
          className="bg-blue-200 p-2 m-1 rounded cursor-move"
        >
          {block.label} {block.inputs.map((input) => `__${input}__`).join(" ")}
        </div>
      ))}
    </div>
  );
}

function Playground({ actionsToPerform, setActions, currActionBlock, setCurrActionBlock }) {
  const handleDrop = (e) => {
    const block = JSON.parse(e.dataTransfer.getData("blockType"));
    block.values = {};
    setActions((prev) => {
      const newActions = [...prev];
      newActions[currActionBlock] = [...(newActions[currActionBlock] || []), block];
      return newActions;
    });
  };

  const handleChange = (blockIdx, key, value) => {
    console.log(blockIdx)
    setActions((prev) => {
      const newActions = [...prev];
      const newBlocks = [...(newActions[currActionBlock] || [])];
      newBlocks[blockIdx].values[key] = value;
      newActions[currActionBlock] = newBlocks;
      return newActions;
    });
  };

  const handleDeleteAction = (arr, idx) => {
    const updated = arr.filter((_, i) => i !== idx);
    const newActions = [...actionsToPerform];
    newActions[currActionBlock] = updated;
    setActions(newActions);
  };

  return (
    <div className="p-4 bg-gray-100 h-96 w-full overflow-auto" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <div className="flex gap-2 mb-2">
      {actionsToPerform.map((_, idx) => (
        <button
          className={`px-3 py-1 rounded ${
            currActionBlock === idx
              ? "bg-blue-600 text-white"
              : "bg-white border"
          }`}
          onClick={() => setCurrActionBlock(idx)}
        >
          Action {idx + 1}
        </button>
      ))}
      </div>
  
      {(actionsToPerform[currActionBlock] || []).map((block, idx) => (
        <div key={idx} className="bg-white p-2 m-1 shadow rounded">
          {block.label}
          {block.inputs.map((input) => (
            <input
              key={input}
              type={input == "text" ? "text" : "number"}
              placeholder={input}
              value={block.values[input] || ""}
              onChange={(e) => handleChange(idx, input, e.target.value)}
              className="border ml-1 p-1 w-16"
            />
          ))}
          <button
            className="px-2 py-1 bg-red-500 text-white rounded"
            onClick={() => handleDeleteAction(actionsToPerform[currActionBlock], idx)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
  
}

function PlayObject({ emoji, position, angle, message, messageType }) {
  return (
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        transform: ` translate(-50%, -50%) rotate(${angle}deg)`,
      }}
      className="w-12 h-12 bg-green-500 rounded-full text-white flex items-center justify-center"
    >
      {emoji}
      {message && (
        <div
          className={`absolute -top-10 px-2 py-1 rounded text-sm text-black ${
            messageType === "speak" ? "bg-white" : "bg-gray-200 italic"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

function checkCollision(posA, posB, size = 10) {
  const dx = posA.left - posB.left;
  const dy = posA.top - posB.top;
  return Math.abs(dx) < size && Math.abs(dy) < size;
}

// eslint-disable-next-line no-unused-vars
function PlayButton({ actionBlock, allobjects, activeObjects, setAllobjects }) {
  async function runAnimation() {
    const previousPosition = {};
      allobjects.forEach((obj) => {
        previousPosition[obj.id] = { ...obj.position };
    });

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    function updateMessage(id, text, type) {
      setAllobjects((prev) =>
        prev.map((obj) =>
          obj.id === id ? { ...obj, message: text, messageType: type } : obj
        )
      );
    }

    async function executeBlockSequence(blocks, currentPos, currentAngle, objId) {
      const nonrepeatedsteps = []
      for (const block of blocks) {
        if (block.type != "repeat") { nonrepeatedsteps.push(block)}
      }
      for (const block of blocks) {
        if (block.type === "move") {
          console.log('move')
          const steps = parseInt(block.values.steps || 0, 10);
          currentPos.left += steps;
        } else if (block.type === "turn") {
          const deg = parseInt(block.values.degrees || 0, 10);
          currentAngle += deg;
        } else if (block.type === "goTo") {
          const x = parseInt(block.values.x || 0, 10);
          const y = parseInt(block.values.y || 0, 10);
          currentPos = { top: y, left: x };
        } else if (block.type === "repeat") {
          const times = parseInt(block.values.times || 0, 10);
          console.log(times)
          console.log(nonrepeatedsteps)
          for (let i = 0; i < times; i++) {
            console.log('run')
            await delay(1000);
            const result = await executeBlockSequence(nonrepeatedsteps, currentPos, currentAngle, objId);
            currentPos = result.currentPos;
            currentAngle = result.currentAngle;
          }
        } else if (block.type === "speak" || block.type === "think") {
          const text = block.values.text || "";
          const time = parseInt(block.values.time || "1000", 10);
          console.log(text)
          updateMessage(objId, text, block.type);
          await delay(time);
          updateMessage(objId, null, null);
        }
        setAllobjects((prev) =>
          prev.map((obj) =>
            obj.id === objId
              ? { ...obj, position: { ...currentPos }, angle: currentAngle }
              : obj
          )
        );
      }
      return { currentPos, currentAngle };
    }
  
    const updatedObjects = [];
    for (const obj of allobjects) {
      const index = allobjects.findIndex(o => o.id === obj.id);
      const blocks = actionBlock[index] || [];
      const { currentPos, currentAngle } = await executeBlockSequence(
        blocks,
        { ...obj.position },
        obj.angle,
        obj.id
      );
      updatedObjects.push({ ...obj, position: currentPos, angle: currentAngle });
    }
    for (let i = 0; i < updatedObjects.length; i++) {
      for (let j = i + 1; j < updatedObjects.length; j++) {
        const objA = updatedObjects[i];
        const objB = updatedObjects[j];
        if (checkCollision(objA.position, objB.position)) {
          await delay(1000);
          updatedObjects[i].position = { ...previousPosition[objB.id] };
          updatedObjects[j].position = { ...previousPosition[objA.id] };
        }
      }
    }
    setAllobjects(updatedObjects)
  }
      
  return (
    <div>
      <button
        onClick={runAnimation}
        className="mt-4 ml-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Play Actions
      </button>
    </div>
  );
}

function AvailableObjects( {allobjects, setAllobjects, activeObjects, setActiveObjects, setActions}) {
  return (
    <div className="flex gap-4 flex-wrap p-4 bg-gray-100">
      {availableItems.map(obj => (
        <div className="flex flex-col items-center p-2">
          <div
            key={obj.id}
            onClick={() => {
              setActiveObjects(prev =>
                prev.includes(obj.id)
                  ? prev.filter(id => id !== obj.id)
                  : [...prev, obj.id]
              );
            }}
            className={`w-20 h-20 rounded border-2 cursor-pointer flex items-center justify-center text-3xl ${
              activeObjects.includes(obj.id)
                ? "border-blue-600 bg-blue-100"
                : "border-gray-300"
            }`}
          >
            {obj.emoji}
          </div>
          <button className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded">
            Play Action {obj.id}
          </button>
        </div>
      ))}
      <button
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => {
          let updatedItems = [];
        
          for (let i = 0; i < activeObjects.length; i++) {
            const spriteId = activeObjects[i];
            const data = availableItems.find((s) => s.id === spriteId);
            const isAlreadyAdded = allobjects.some((obj) => obj.emoji === data.emoji);
            console.log(isAlreadyAdded)
            if (!isAlreadyAdded) {
              updatedItems.push({
                id: allobjects.length + updatedItems.length + 1,
                name: data.name,
                emoji: data.emoji,
                blocks: [],
                position: { top: 200, left: 600 },
                angle: 0,
                message: null,
                messageType: null
              });
            }
          }
        
          if (updatedItems.length > 0) {
            setAllobjects([...allobjects, ...updatedItems]);
            setActions((prev) => [...prev, ...updatedItems.map(() => [])]);
          }
        
          setActiveObjects([]); 
        }}
      >
        ➕ Add Selected Sprites
      </button>
  </div>
  )
}
function App() {
  // const [blocks, setBlocks] = useState([]);
  const [allobjects, setAllobjects] = useState([availableItems[0]]);
  const [activeObjects, setActiveObjects] = useState([availableItems[0].id]);
  const [actionsToPerform, setActions] = useState([[]]);
  const [currActionBlock, setCurrActionBlock] = useState(0);

  return (
    <div className="flex">
      <ActionsTab />
      <div className="flex-1 relative">
        <div className="h-[400px] overflow-auto bg-gray-100">
          <Playground currActionBlock={currActionBlock} setCurrActionBlock={setCurrActionBlock} actionsToPerform={actionsToPerform} setActions={setActions}/>
        </div>
        <div className="absolute inset-0 pointer-events-none z-20">
          {allobjects.map((sprite) => (
            <PlayObject
              key={sprite.id}
              emoji={sprite.emoji}
              position={sprite.position}
              angle={sprite.angle}
              message={sprite.message}
              messageType={sprite.messageType}
            />
          ))}
        </div>
        <PlayButton actionBlock={actionsToPerform} allobjects={allobjects} activeObjects={activeObjects} setAllobjects={setAllobjects}/>
        <AvailableObjects allobjects= {allobjects} setAllobjects={setAllobjects} activeObjects={activeObjects} setActiveObjects={setActiveObjects} setActions={setActions}/>
      </div>
    </div>
  );
}

export default App;
