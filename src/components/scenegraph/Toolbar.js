import React from 'react';
import Events from '../../lib/Events.js';
import {saveBlob, saveString} from '../../lib/utils';
import MotionCapture from './MotionCapture';

const LOCALSTORAGE_MOCAP_UI = 'aframeinspectormocapuienabled';

function filterHelpers (scene, visible) {
  scene.traverse((o) => {
    if (o.userData.source === 'INSPECTOR') { o.visible = visible; }
  });
}

function getSceneName (scene) {
  return scene.id || slugify(window.location.host + window.location.pathname);
}

/**
 * Slugify the string removing non-word chars and spaces
 * @param  {string} text String to slugify
 * @return {string}      Slugified string
 */
function slugify (text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '-')      // Replace all non-word chars with -
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Tools and actions.
 */
export default class Toolbar extends React.Component {
  constructor (props) {
    super(props);

    Events.on('togglemotioncapture', () => {
      this.toggleMotionCaptureUI();
    });

    this.state = {
      motionCaptureUIEnabled: JSON.parse(localStorage.getItem(LOCALSTORAGE_MOCAP_UI))
    };
  }

  exportSceneToGLTF () {
    ga('send', 'event', 'SceneGraph', 'exportGLTF');
    const sceneName = getSceneName(AFRAME.scenes[0]);
    const scene = AFRAME.scenes[0].object3D;
    filterHelpers(scene, false);
    AFRAME.INSPECTOR.exporters.gltf.parse(scene, function (buffer) {
      filterHelpers(scene, true);
      const blob = new Blob([buffer], {type: 'application/octet-stream'});
      saveBlob(blob, sceneName + '.glb');
    }, {binary: true});
  }

  addEntity () {
    Events.emit('createnewentity', {element: 'a-entity', components: {}});
  }

  toggleMotionCaptureUI = () => {
    ga('send', 'event', 'SceneGraph', 'openMotionCapture');
    localStorage.setItem(LOCALSTORAGE_MOCAP_UI, !this.state.motionCaptureUIEnabled);
    this.setState({motionCaptureUIEnabled: !this.state.motionCaptureUIEnabled});
  }

  /**
   * Try to write changes with aframe-inspector-watcher.
   */
  writeChanges = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:51234/save');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      message: 'hello'
    }));
  }

  render () {
    return (
      <div id="scenegraphToolbar">
        <div className='scenegraph-actions'>
          <a className='button fa fa-plus' title='Add a new entity' onClick={this.addEntity}></a>
          <a className='button fa fa-video-camera' title='Open motion capture development tools' onClick={this.toggleMotionCaptureUI} style={this.state.motionCaptureUIEnabled ? {color: '#FFF'} : {}}></a>
          <a className='button fa fa-download' title='Export to GLTF' onClick={this.exportSceneToGLTF}></a>
          <a className='button fa fa-save' title='Write changes with aframe-inspector-watcher' onClick={this.writeChanges}></a>
        </div>

        {this.state.motionCaptureUIEnabled && <MotionCapture/>}
      </div>
    );
  }
}
