import React, { Component } from 'react';
import {render} from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import KanbanBoard from './KanbanBoard';
import EditCard from './EditCard'
import NewCard from './NewCard';
import KanbanBoardContainer from "./KanbanBoardContainer";



render((
  <Router history={hashHistory}>
    <Route component = {KanbanBoardContainer}>
      <Route path='/' component={KanbanBoard}>
        <Route path='new' component={NewCard} />
        <Route path='edit/:card_id' component={EditCard} />
      </Route>
    </Route>
  </Router>
), document.getElementById('root'));
