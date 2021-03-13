import React, { useState } from 'react';
import axios from 'axios';

export default () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [timems, setTimems] = useState('');

  const onSubmit = async event => {
    event.preventDefault();

    // await axios.post('http://localhost:3001/api/publish/open', {
    //   title,content,timems
    // });

    await axios.post('http://pub-it.dev/api/publish/open', {
      title,content,timems
    });

    setTitle('');
  };

  return (
    <div className="w-50 p-3" >
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="form-control"
          />
          <label>Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="form-control"
          />
          <label>Close in (sec)</label>
          <input type="number"
            value={timems}
            onChange={e => setTimems(e.target.value)}
            className="form-control"
          />
        </div>
        <button className="btn btn-primary">Publish It</button>
      </form>
    </div>
  );
};