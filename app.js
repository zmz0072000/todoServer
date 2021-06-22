const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {Sequelize} = require('sequelize');
const {Op} = Sequelize

const lists = require('./models/lists');
const items = require('./models/items')

async function ifListExists(listName) {
  let filter = {
    where: {
      listName: listName
    }
  }
  let listSearchResult = await lists.findOne(filter);
  if (listSearchResult === null){
    console.log('list not exist');
    return false;
  }
  else {
    console.log('list exists')
    return true;
  }
}

async function getListId(listName) {
  let filter = {
    where: {
      listName: listName
    }
  }
  let listSearchResult = await lists.findOne(filter);
  if (listSearchResult === null){
    console.log('list not exist');
    return -1;
  }
  else {
    let id = listSearchResult.get('id');
    console.log('list exists, it is ');
    console.log(id);
    return id;
  }
}

async function ifItemExists(listId, itemName) {
  let filter = {
    where: {
      list_id: listId,
      itemName: itemName
    }
  }
  let itemSearchResult = await items.findOne(filter);
  if (itemSearchResult === null){
    console.log('item not exist');
    return false;
  }
  else {
    console.log('item exists')
    return true;
  }
}

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Deleted default use statement
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// sample get request handler
app.get('/', (req, res) => {
  //res.send('Hello world');
  res.render('index', {title: 'Test Todo Server'});
})

// required get handler
// get a list of todo lists
app.get('/api/lists', function (req, res) {
lists.findAll().then((list) => {
  res.json(list);
})
})
// get items in a specific list
app.get('/api/items', async function (req, res) {
  let searchListName = req.query.listName;

  if (typeof searchListName === 'undefined') {
    res.end('listName missing');
    return;
  }

  //Blank input check
  if (searchListName === '') {
    res.end('listName blank');
    return;
  }

  //List exists check
  let searchListId = await getListId(searchListName);
  if (searchListId === -1) {
    res.end('list not found');
    return;
  }
  let filter = {
    where: {
      list_id: searchListId
    }
  };

  items.findAll(filter).then((item) => {
    res.json(item);
  })
})

// required post handler
// create a list
app.post('/api/lists', async function (req, res) {
  let newListName = req.query.listName

  //Empty input check
  if (typeof newListName == 'undefined') {
    res.end('new list can\'t be created: listName missing');
    return;
  }

  //Blank input check
  if (newListName === '') {
    res.end('new list can\'t be created: listName blank');
    return;
  }

  //Already exists check
  let listSearchResult = await ifListExists(newListName);

  if (listSearchResult === true) {
    res.end('new list can\'t be created: listName already exists');
  } else {
    //Finally, create list
    lists.create({
      listName: newListName
    }).then((list) => {
      res.json(list);
    })
  }

})
// create a item in a specific list
app.post('/api/items', async function (req, res) {
  let newListName = req.query.listName
  let newItemName = req.query.itemName

  //Empty input check
  if (typeof newListName == 'undefined') {
    res.end('new item can\'t be created: listName missing');
    return;
  }
  if (typeof newItemName == 'undefined') {
    res.end('new item can\'t be created: itemName missing');
    return;
  }

  //Blank input check
  if (newListName === '') {
    res.end('new item can\'t be created: listName blank');
    return;
  }
  if (newItemName === '') {
    res.end('new item can\'t be created: itemName blank');
    return;
  }

  //List exists check
  let newListId = await getListId(newListName);
  if (newListId === -1) {
    res.end('new item can\'t be created: list not found');
    return;
  }

  //Item exists check
  let itemSearchResult = await ifItemExists(newListId, newItemName);
  if (itemSearchResult === true) {
    res.end('new item can\'t be created: identical item exists');
    return;
  }

  //Finally, create list
  items.create({
    list_id: newListId,
    itemName: newItemName
  }).then((item) => {
    res.json(item);
  })

})

// Requested delete handler
// Delete a list
app.delete('/api/lists', async function(req, res){
  let deleteListName = req.query.listName

  //Empty input check
  if (typeof deleteListName == 'undefined') {
    res.end('list can\'t be deleted: deleteListName missing');
    return;
  }
  //Blank input check
  if (deleteListName === '') {
    res.end('list can\'t be deleted: deleteListName blank');
    return;
  }

  //Find and delete list
  let filter = {
    where: {
      listName: deleteListName
    }
  }
  let listSearchResult = await lists.findOne(filter);
  if (listSearchResult === null){
    res.end('list can\'t be deleted: list not exist');
  }
  else {
    listSearchResult.destroy().then(() => {
      res.status(204).send();
    });
  }


})

// Delete an item
app.delete('/api/items', async function (req, res) {
  let deleteListName = req.query.listName
  let deleteItemName = req.query.itemName

  //Empty input check
  if (typeof deleteListName == 'undefined') {
    res.end('item can\'t be deleted: listName missing');
    return;
  }
  if (typeof deleteItemName == 'undefined') {
    res.end('item can\'t be deleted: itemName missing');
    return;
  }

  //Blank input check
  if (deleteListName === '') {
    res.end('item can\'t be deleted: listName blank');
    return;
  }
  if (deleteItemName === '') {
    res.end('item can\'t be deleted: itemName blank');
    return;
  }

  //List exists check
  let deleteListId = await getListId(deleteListName);
  if (deleteListId === -1) {
    res.end('item can\'t be deleted: list not found');
    return;
  }

  //Find and delete item
  let filter = {
    where: {
      list_id: deleteListId,
      itemName: deleteItemName,
    }
  }
  let itemSearchResult = await items.findOne(filter);
  if (itemSearchResult === null){
    res.end('item can\'t be deleted: item not exist');
  }
  else {
    itemSearchResult.destroy().then(() => {
      res.status(204).send();
    });
  }

})

// Requested put handler
app.put('/api/items', async function (req, res) {
  let switchListName = req.query.listName
  let switchItemName = req.query.itemName

  //Empty input check
  if (typeof switchListName == 'undefined') {
    res.end('item can\'t be switched: listName missing');
    return;
  }
  if (typeof switchItemName == 'undefined') {
    res.end('item can\'t be switched: itemName missing');
    return;
  }

  //Blank input check
  if (switchListName === '') {
    res.end('item can\'t be switched: listName blank');
    return;
  }
  if (switchItemName === '') {
    res.end('item can\'t be switched: itemName blank');
    return;
  }

  //List exists check
  let switchListId = await getListId(switchListName);
  if (switchListId === -1) {
    res.end('item can\'t be switched: list not found');
    return;
  }

  //Find and delete item
  let filter = {
    where: {
      list_id: switchListId,
      itemName: switchItemName,
    }
  }
  let itemSearchResult = await items.findOne(filter);
  if (itemSearchResult === null){
    res.end('item can\'t be switched: item not exist');
  }
  else {
    let isFinished = itemSearchResult.get('itemFinished');
    if (typeof isFinished != 'boolean'){
      res.end('item can\'t be switched: item isFinished state not correct');
    }
    else if (!isFinished){
      await itemSearchResult.update({
        itemFinished: true
      });
      res.end('item marked as finished');
    }
    else {
      await itemSearchResult.update({
        itemFinished: false
      });
      res.end('item marked as NOT finished');
    }
  }
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
