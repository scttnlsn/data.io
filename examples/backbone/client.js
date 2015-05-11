var example = window.example || (window.example = {});

var connection = data(io.connect());

var MessageView = Backbone.View.extend({

  tagName: 'li',

  events: {
    'click .delete': 'delete'
  },

  initialize: function () {
    this.template = _.template($('#message-template').html());
  },

  render: function () {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },

  delete: function (e) {
    e.preventDefault();
    this.model.destroy();
  }

});

var MessagesView = Backbone.View.extend({

  events: {
    'click .send': 'send',
    'keypress .message': 'keypress'
  },

  initialize: function (options) {
    this.messages = options.messages;
    this.messages.on('add change remove reset', this.render, this);
    this.template = _.template($('#messages-template').html());
  },

  render: function () {
    $(this.el).html(this.template());

    this.messages.each(function (message) {
      var view = new MessageView({ model: message });
      this.$('ul').append(view.render().el);
    }.bind(this));

    return this;
  },

  getText: function () {
    return this.$('.message').val();
  },

  clearText: function () {
    this.$('.message').val('');
  },

  send: function () {
    this.messages.create({ text: this.getText() }, {
      error: function (model, err) {
        model.destroy();
        alert('Error: ' + err.message);
      }
    });

    this.clearText();
  },

  keypress: function (e) {
    if (e.which === 13) this.send();
  }

});

$(function () {
  var messages = new Backbone.Collection();
  example.sync(messages, connection.resource('messages'));
  messages.fetch();

  var view = new MessagesView({ el: document.body, messages: messages });
  view.render();

  example.messages = messages;
  example.view = view;
});
