import React, {Component} from 'react';
import { throttle } from './utils.js';
import KanbanBoard from './KanbanBoard';
import update from 'react-addons-update';
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
    this.updateCardStatus = throttle(this.updateCardStatus.bind(this));
    this.updateCardPosition = throttle(this.updateCardPosition.bind(this), 500);
  }

  addTask(cardId, taskName) {
    //Keep a reference to the original state prior to the mutations in case of reverting to the optimistic changes in the UI
    let prevState = this.state;
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
    .then((response) => {
      if (response.ok) {
        return responseData.json()
      } else {
        //Throw an error if server response wasn't ok
        throw new Error('the server response wasn\'t ok' )
      }
    })
    .then((responseData) => {
      //When the server returns the definitive ID - update ID on React
      newTask.id = responseData.id;
      this.setState({cards: nextState});
    })
    .catch((error) => {
      this.setState(prevState);
    })
  }


  deleteTask(cardId, taskId, taskIndex) {
    //Keep a reference to the original state prior to the mutations in case of reverting to the optimistic changes in the UI
    let prevState = this.state;
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
    .then((response) => {
      if (response.ok) {
        return responseData.json()
      } else {
        //Throw an error if server response wasn't ok
        throw new Error('the server response wasn\'t ok' )
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error)
      this.setState(prevState);
    })
  }


  toggleTask(cardId, taskId, taskIndex) {
    //Keep a reference to the original state prior to the mutations in case of reverting to the optimistic changes in the UI
    let prevState = this.state;
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
    .then((response) => {
      if (response.ok) {
        return responseData.json()
      } else {
        //Throw an error if server response wasn't ok
        throw new Error('the server response wasn\'t ok' )
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error)
      this.setState(prevState);
    })
  }

  updateCardStatus(cardId, listId) {
    //Find the index of the card
    let cardIndex = this.state.cards.findIndex((card) => card.id == cardId);
    //Get the current card
    let card = this.state.cards[cardIndex];
    //Only proceed if hovering over a different list
    if(card.status !== listId) {
      //set the component to the mutated object
      this.setState(update(this.state, {
        cards: {
          [cardIndex]: {
            status: {$set: listId}
          }
        }
      }))
    }
  }

  updateCardPosition(cardId, afterId) {
    //Only proceed if hovering over a different card
    if(cardId !== afterId) {
      //Find the index of the card
      let cardIndex = this.state.cards.findIndex((card) => card.id === cardId);
      //Get the current card
      let card = this.state.cards[cardIndex];
      //Find the index of the card the user is hovering over
      let afterIndex = this.state.cards.findIndex((card) => card.id === afterId);
      //Use splice to remove the card and reinsert it at the new index
      this.setState(update(this.state, {
        cards: {
          $splice: [
            [cardIndex, 1],
            [afterIndex, 0, card]
          ]
        }
      }))
    }
  }

  persistCardDrag (cardId, status) {
    //Find the index of the card
    let cardIndex = this.state.cards.findIndex((card) => card.id==cardId);
    //Get the current card
    let card = this.state.cards[cardIndex];

    fetch(`${API_URL}/cards/${cardId}`, {
      method: 'put',
      headers: API_HEADERS,
      body: JSON.stringify({status: card.status, row_order_position: cardIndex})
    })
    .then((response) =>{
      if(!response.ok){
        throw new Error("Server response wasn't OK")
      }
    })
    .catch((error)=> {
      console.error("Fetch error:", error);
      this.setState(update(this.state, {
        cards: {
          [cardIndex]: {
            status: {$set: status}
          }
        }
      }))
    })
  }

  addCard(card) {
    //Keep a reference to the original state prior to the mutations
    //in case we need to rever the optimistic changes in the UI
    let prevState = this.state;

    //Add a temporary ID to the card
    if (card.id === null) {
      let card = Object.assign({}, card, {id: Date.now()});
    }

    //Create a new object and push the new card to the array of cards
    let nextState = update(this.state.cards, {$push: [card] });

    //set the component state to the mutated object
    this.setState({cards: nextState});

    //Call the API to add the card on the server

    fetch(`${API_URL}/cards`, {
      method: 'post',
      headers: API_HEADERS,
      body: JSON.stringify(card)
    })
    .then((resoponse) => {
      if(response.ok) {
        return response.json()
      } else {
        //Throw an error
        throw new Error('Server response wasn\'t OK')
      }
    })
    .then((responseData) => {
      card.id = responseData.id
      this.setState({cards:nextState});
    })
    .catch((error) => {
      this.setState(prevState);
    })
  }

  updateCard(card) {
    let prevState = this.state;

    //Find the index of the card
    let cardIndex = this.state.cards.findIndex((c) => c.id == card.id);

    //Change the whole card using $set
    let nextState = update(
                        this.state.cards, {
                          [cardIndex] : {$set: card}
                        });
    //Set the component state to the mutates object
    this.setState({cards:nextState});

    //Call the API to update the card on the server
    fetch(`${API_URL}/cards/${card.id}`, {
      method: 'put',
      headers: API_HEADERS,
      body: JSON.stringify(card)
    })
    .then((resoponse) => {
      if(response.ok) {
        return response.json()
      } else {
        //Throw an error
        throw new Error('Server response wasn\'t OK')
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      this.setState(prevState);
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
    let kanbanBoard = this.props.children && React.cloneElement(this.props.children, {
      cards:this.state.cards,
      taskCallbacks: {
        toggle: this.toggleTask.bind(this),
        delete: this.deleteTask.bind(this),
        add: this.addTask.bind(this)
      },
      cardCallbacks: {
        addCard: this.addCard.bind(this),
        updateCard: this.updateCard.bind(this),
        updateStatus: this.updateCardStatus.bind(this),
        updatePosition: throttle(this.updateCardPosition.bind(this), 500),
        persistMove: this.persistCardDrag.bind(this)
      }
    })
    return kanbanBoard;
  }
}

export default KanbanBoardContainer;
