import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {removeEntity, cloneEntity} from '../../lib/entity';

const Events = require('../../lib/Events.js');

const ICONS = {
  camera: 'fa-camera',
  mesh: 'fa-cube',
  light: 'fa-lightbulb-o',
  text: 'fa-font'
};

export default class Entity extends React.Component {
  static propTypes = {
    depth: PropTypes.number,
    entity: PropTypes.object,
    isExpanded: PropTypes.bool,
    isFiltering: PropTypes.bool,
    isSelected: PropTypes.bool,
    selectEntity: PropTypes.func,
    toggleExpandedCollapsed: PropTypes.func
  };

  constructor (props) {
    super(props);
    this.state = {};
  }

  onClick = () => this.props.selectEntity(this.props.entity)

  onDoubleClick = () => Events.emit('objectfocus', this.props.entity.object3D)

  toggleVisibility = () => {
    const entity = this.props.entity;
    const visible = entity.tagName.toLowerCase() === 'a-scene'
      ? entity.object3D.visible
      : entity.getAttribute('visible');
    entity.setAttribute('visible', !visible);
  }

  render () {
    const isFiltering = this.props.isFiltering;
    const isExpanded = this.props.isExpanded;
    const entity = this.props.entity;
    const tagName = entity.tagName.toLowerCase();

    // Clone and remove buttons if not a-scene.
    const cloneButton = tagName === 'a-scene' ? null : (
      <a onClick={() => cloneEntity(entity)}
         title="Clone entity" className="button fa fa-clone"></a>
    );
    const removeButton = tagName === 'a-scene' ? null : (
      <a onClick={event => { event.stopPropagation(); removeEntity(entity); }}
         title="Remove entity" className="button fa fa-trash-o"></a>
    );

    // Add spaces depending on depth.
    const pad = '    '.repeat(this.props.depth);
    let collapse;
    if (entity.children.length > 0 && !isFiltering) {
      collapse = (
        <span onClick={() => this.props.toggleExpandedCollapsed(entity)}
              className={`collapsespace fa ${isExpanded ? 'fa-caret-down' : 'fa-caret-right'}`}></span>
      );
    } else {
      collapse = <span className="collapsespace"></span>;
    }

    // Visibility button.
    const visible = tagName === 'a-scene' ? entity.object3D.visible : entity.getAttribute('visible');
    const visibilityButton = (
      <i title="Toggle entity visibility" className={'fa ' + (visible ? 'fa-eye' : 'fa-eye-slash')}
         onClick={this.toggleVisibility}></i>
    );

    // Class name.
    const className = classnames({
      active: this.props.isSelected,
      entity: true,
      novisible: !visible,
      option: true
    });

    // Representation.
    let entityName = entity.id;
    if (!entity.isScene && !entityName && entity.getAttribute('class')) {
      entityName = entity.getAttribute('class').split(' ')[0];
    }
    if (!entity.isScene && !entityName && entity.getAttribute('mixin')) {
      entityName = entity.getAttribute('mixin').split(' ')[0];
    }

    // Icons.
    let icons = '';
    for (let objType in ICONS) {
      if (!entity.getObject3D(objType)) { continue; }
      icons += '&nbsp;<i class="fa ' + ICONS[objType] + '" title="' + objType + '"></i>';
    }

    return (
      <div className={className} onClick={this.onClick}>
        <span>
          {visibilityButton} {pad} {collapse}&lt;
          <span onDoubleClick={this.onDoubleClick}>
            {tagName}<span className="name">{entityName ? ` ${entityName}` : ''}</span>
          </span>
          <span dangerouslySetInnerHTML={{__html: icons}}></span>&gt;
        </span>
        <span className="icons">
          {cloneButton}
          {removeButton}
        </span>
      </div>
    );
  }
}
