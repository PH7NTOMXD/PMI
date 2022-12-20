var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

var Message = mongoose.model('Message', {
  name: String,
  message: String
});

//Database connection
var dbUrl = "mongodb://Pragyan:Pragyan97@ds135796.mlab.com:35796/chatbox";

app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({
    name: user
  }, (err, messages) => {
    res.send(messages);
  });
});


app.post('/messages', async (req, res) => {
  try {
    var message = new Message(req.body);

    var savedMessage = await message.save()
    console.log('saved');

    var censored = await Message.findOne({
      message: 'badword'
    });
    if (censored)
      await Message.remove({
        _id: censored.id
      })
    else
      io.emit('message', req.body);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    return console.log('error', error);
  } finally {
    console.log('Message Posted')
  }
});

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', () => {
  console.log('a user is connected')
});

mongoose.connect(dbUrl, {
  useNewUrlParser: true
}, (err) => {
  console.log('mongodb connected', err);
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Starting on ${port}`);
});