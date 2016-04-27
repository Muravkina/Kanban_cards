import React, { Component } from 'react';
import {render} from 'react-dom';

import KanbanBoardContainer from "./KanbanBoardContainer";

// let cardsList = [
//   {
//     id: 1,
//     title: 'Read the Book',
//     description: 'I should read thewhole book',
//     status: 'in-progress',
//     tasks: []
//   },
//   {
//     id: 2,
//     title: 'Write some code',
//     description: "Code alomg with the samples in the book",
//     status: 'todo',
//     tasks: [
//       {
//         id: 1,
//         name: 'ContactList Example',
//         done: true
//       },
//       {
//         id: 2,
//         name: 'KanbanExample',
//         done: false
//       },
//       {
//         id: 3,
//         name: 'My own experiences',
//         done: false
//       }
//     ]
//   }
// ]


render(<KanbanBoardContainer />, document.getElementById('root'));
