'use strict';
var React = require('react');
var utilities = require('../utilities');
var config = require('../config');

var LocationMap = React.createClass({
  getInitialState: function() {
    return ({
      header: ''
    });
  },
  componentWillMount: function() {
    utilities.ajax('get', config.path.location, function(data) {
      var temp = JSON.parse(data);
      this.setState({
        header: temp.title
      });
    }.bind(this));
  },
  render: function() {
    return (
      <section id="location" className="page-wrap">
        <h2 className="module-header">{this.state.header}</h2>
        <div className="location">
          <iframe height="500" 
          src="https://www.google.com/maps/embed/v1/place?q=45%20%D0%B2%D1%83%D0%BB%D0%B8%D1%86%D1%8F%20%D0%9E%D0%BB%D0%B5%D0%BD%D0%B8%20%D0%A1%D1%82%D0%B5%D0%BF%D0%B0%D0%BD%D1%96%D0%B2%D0%BD%D0%B8%2C%20%D0%9B%D1%8C%D0%B2%D1%96%D0%B2%2C%20%D0%9B%D1%8C%D0%B2%D1%96%D0%B2%D1%81%D1%8C%D0%BA%D0%B0%20%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C%2C%20%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D0%B0&key=AIzaSyDbHy0WuueUyg10oJeFzz_qPpCb1yuqZ20&center=">
          </iframe>
        </div>
      </section>
    );
  }
});

module.exports = LocationMap;
