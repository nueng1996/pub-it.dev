import React from 'react';
import Publish from './Publish';
import PublishList from './PublishList';

export default () => {
  return (
    <div>
      <center>Pub-it.dev</center>
      <div className="container">
        <h3>publish Post</h3>
        <Publish />
        <hr />
        <h1>Pub BOARD</h1>
        <PublishList />
      </div>
    </div>
  );
};