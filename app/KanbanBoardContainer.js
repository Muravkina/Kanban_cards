import React, {Component} from 'react';
import KanbanBoard from './KanbanBoard';
import 'whatwg-fetch';
import 'babel-polyfill'

const API_URL = 'http://kanbanapi.pro-react.com';
const API_HEADERS = {
  'Content-Type': 'application/json',
  Authorization : '_mura_@mail.ru'
}

class KanbanBoardContainer extends Component {
  constructor() {
    super();
    this.state = {
      cards: []
    };
  }
  addTask(cardId, taskName) {
    //Find the index of the card
    let cardIndex = this.state.cards.findIndex((card) => {
      card.id == cardId;
    })
    //Create a new task with the given name and a temporary ID
    let newTask = {id: Date.now(), name: taskName, done: false};
    //Create a new object and push the new task to the array of tasks
    let nextState = update(this.state.cards, {
                      [cardIndex]: {
                        tasks: {$push: [newTask]}
                      }
                    });
    //set the component state to the mutated object
    this.setState({cards:nextState});
    //Call the api to add the task on the server
    fetch(`${API_URL}/cards/${cardId}/tasks`, {
      method: 'post',
      headers: API_HEADERS,
      body: JSON.stringify(newTask)
    })
    .then((response) => responseData.json())
    .then((responseData) => {
      //When the server returns the definitive ID - update ID on React
      newTask.id = responseData.id;
      this.setState({cards: nextState});
    })
  }
  deleteTask(cardId, taskId, taskIndex) {
    //Find the index of the card
    let cardIndex = this.state.cards.findIndex((card) => {
      card.id == cardId;
    })

    //Create a new object without the task
    let nextState = update(this.state.cards, {
                      [cardIndex]: {
                        tasks: {$splice: [[taskIndex, 1]]}
                      }
                    });
    //Set the component state to the mutated object
    this.setState({cards: nextState});
    //Call the API to remove the task on the server
    fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
      method: 'delete',
      headers: API_HEADERS
    })
  }


  toggleTask(cardId, taskId, taskIndex) {
    //Find the index of the card
    let cardIndex = this.state.cards.findIndex((card) => {
      card.id === cardId;
    })
    //Save a reference to the task's 'done' value
    let newDoneValue;
    //Using the $appply command, change the done value to its opposite
    let nextState = update(this.state.cards, {
                      [cardIndex]: {
                        tasks: {
                          [taskIndex]: {
                            done: {$apply: (done) => {
                              newDoneValue = !done
                              return newDoneValue;
                            }}
                          }
                        }
                      }
                    })
    //Set the component state to the mutated object
    this.setState({cards: nextState});
    //Call the API to toggle the task on the server
    fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
      method: 'put',
      headers: API_HEADERS,
      body: JSON.stringify({done:newDoneValue})
    })
  }
  componentDidMount() {
    fetch(API_URL+'/cards', {headers: API_HEADERS})
    .then((response) => response.json())
    .then((responseData) => {
      this.setState({cards:responseData});
    })
    .catch((error) => {
      console.log('Error fetching and parsing data', error);
    })
  }
  render() {
    return <KanbanBoard cards={this.state.cards}
                        taskCallbacks={{
                          toggle: this.toggleTask.bind(this),
                          delete: this.deleteTask.bind(this),
                          add: this.addTask.bind(this)
                        }} />
  }
}

export default KanbanBoardContainer;
