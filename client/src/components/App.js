import React, {useEffect, useState} from 'react';
import './App.css';
import axios from 'axios';
import _ from 'underscore';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import Column from './Column';

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  height: 75px;
  position: fixed;
  top: 87%;
  width: 95%;
`;
// const Delete = styled.div`
// `;
const Title = styled.div`
  width: 10vw;
  padding: 8px 0;
  border: 1px solid lightgrey;
  border-radius: 2px;
`;

function App() {
  const [rbs, setRbs] = useState([]);
  const [wrs, setWrs] = useState([]);
  const [qbs, setQbs] = useState([]);
  const [tes, setTes] = useState([]);
  const [position, setPosition] = useState('rbs');
  const [top200, setTop200] = useState([]);
  const [pick, setPick] = useState(1);


  useEffect(() => {
    axios.get('http://localhost:3001/rbs')
      .then(res => {
        const rbsWithRanks = res.data.map((rb, index) => {
          return {...rb, position_rank: index + 1};
        })
        setRbs(rbsWithRanks);
      })

    axios.get('http://localhost:3001/all')
      .then(res => {
        const allWithRanks = res.data.map((player, index) => {
          return {...player, overall_rank: index + 1};
        })
        setTop200(allWithRanks);
        axios.put('http://localhost:3001/all', top200);
      })
  }, []);

  const setPositionPlayers = (players, curPos) => {
    curPos === 'rbs' ? setRbs(players) : curPos === 'wrs' ? setWrs(players) : curPos === 'qbs' ? setQbs(players) : curPos === 'tes' ? setTes(players) : setTop200(players);
  }

  const promiseMemoize = (fn) => {
    let cache = {}
    return (...args) => {
      let strX = JSON.stringify(args);
      return strX in cache ? cache[strX]
        : (cache[strX] = fn(...args).catch((x) => {
            delete cache[strX];
            return x;
          }))
    }
  }

  const originalMakeCall = (url, options) => {
    return axios.get(url, options);
  }

  const makeCall = promiseMemoize(originalMakeCall);

  const handleChangeTab = async (curPos) => {
      const {data} = await makeCall(`http://localhost:3001/${curPos}`);
      const playersWithRanks = data.map((player, index) => {
        return {...player, position_rank: index + 1};
      })
      setPositionPlayers(playersWithRanks, curPos);
      setPosition(curPos);
    }

  const onDragEnd = async (result) => {
    console.log(result)
    const {destination, source} = result;
    const newPlayers = source.droppableId === 'rbs' ? [...rbs] : source.droppableId === 'wrs' ? [...wrs] : source.droppableId === 'qbs' ? [...qbs] : source.droppableId === 'tes' ? [...tes] : [...top200];
    const displayPlayers = newPlayers.slice();
    let url = source.droppableId === 'top200' ? 'http://localhost:3001/all' : `http://localhost:3001/${position}`;

    if (!destination) {
      newPlayers[source.index].position_rank = null;
      newPlayers[source.index].overall_rank = null;

      displayPlayers.splice(source.index, 1);
      setPositionPlayers(displayPlayers, source.droppableId);
    } else {
      if (destination && destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }
      // if (destination.droppableId === 'remove') {
      //   newPlayers[source.index].position_rank = null;

      //   displayPlayers.splice(source.index, 1);
      //   setPositionPlayers(displayPlayers, source.droppableId);
      // } else
      let temp = newPlayers[source.index];
      newPlayers.splice(source.index, 1);
      newPlayers.splice(destination.index, 0, temp);

      newPlayers.map((player, index) => {
        if (source.droppableId === 'top200') {
          player.overall_rank = (index + 1);
          player.diff = player.yahoo_rank - player.overall_rank;
        } else {
          player.position_rank = (index + 1);
        }
      });
      setPositionPlayers(newPlayers, source.droppableId);
    }

    axios.put(url, newPlayers)
        .then(() => {
          console.log('successfully updated players');
        })
        .catch(() => console.log('failed to update players'));
  }

  return (
    <div className="App">
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', marginLeft: '8px', width: '40vw'}}>
          <Title className={position === 'rbs' && "selected"} onClick={() => handleChangeTab('rbs')}>RBs</Title>
          <Title className={position === 'wrs' && "selected"} onClick={() => handleChangeTab('wrs')}>WRs</Title>
          <Title className={position === 'qbs' && "selected"} onClick={() => handleChangeTab('qbs')}>QBs</Title>
          <Title className={position === 'tes' && "selected"} onClick={() => handleChangeTab('tes')}>TEs</Title>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Column players={position === 'rbs' ? rbs : position === 'wrs' ? wrs : position === 'qbs' ? qbs : tes} droppableId={position}/>
          {/* <Container>
            <Droppable droppableId={'remove'}>
              {provided => (
                <Delete
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  Remove Player
                  {provided.placeholder}
                </Delete>
              )}
            </Droppable>
          </Container> */}
        </DragDropContext>
      </div>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <select id="dropdown" value={pick} onChange={(e) => setPick(Number(e.target.value))}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
            <option value={11}>11</option>
            <option value={12}>12</option>
          </select>
          <h4 style={{margin: '9px'}}>The Top 200</h4>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Column players={top200} droppableId={'top200'} pick={pick}/>
        </DragDropContext>
      </div>
    </div>
  )
}

export default App;