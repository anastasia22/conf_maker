var React = require('react');
var config = require('../config');
var utilities = require('../utilities');
var ReactIntl = require('react-intl');
var IntlMixin     = ReactIntl.IntlMixin;
var FormattedDate = ReactIntl.FormattedDate;

var OverviewBlock = React.createClass({
  mixins: [IntlMixin],
  getInitialState: function(){
    return {
      mainInfo:[]
    }
  },
  componentDidMount: function() {
    utilities.ajax('get', config.path.mainInfo, function(data) {
      this.setState({mainInfo: JSON.parse(data)});
    }.bind(this));
  },
  render: function() {
    var conferenceInfo = this.state.mainInfo.map(function(info){
      return <Overview mainInfo={info} key={info.name}/>
    });
    return (
      <section id="overview" className="page-wrap">
        <div className="overview">
          {conferenceInfo}
          <div className="overview__wrap"></div>
        </div>
      </section>

    )
  }
});

var Overview = React.createClass({
  mixins: [IntlMixin],
  render:function(){
    return(
      <div className="overview__content">
        <h2>{this.props.mainInfo.name}</h2>
        <div className="overview__about">{this.props.mainInfo.about}</div>
        <div className="overview__info">
          <div className="overview__infoBlock">
            <div className="overview__infoIcon overview__infoIcon--when"></div>
            <div className="overview__infoData overview__infoData--when">
              <span>
                <FormattedDate
                  value={new Date()}
                  day="numeric"
                  month="long"
                  year="numeric" />
              </span>
            </div>
          </div>
          <div className="overview__infoBlock">
            <div className="overview__infoIcon overview__infoIcon--where"></div>
            <div className="overview__infoData overview__infoData--where">
              <span>{this.props.mainInfo.location}</span>
            </div>
          </div>
        </div>

      </div>
    )
  }
});

module.exports = OverviewBlock;
