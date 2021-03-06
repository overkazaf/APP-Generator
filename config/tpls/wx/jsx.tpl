import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import 'scss/base.scss';
import 'scss/{{PageName}}/index.scss';

class PageComponent extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="m-{{pagename}}">
				<div className="m-header"></div>
				<div className="m-body">
					{{pagename}} Component to implement
				</div>
				<div className="m-footer"></div>
			</div>
		)
	}
}

ReactDOM.render(<PageComponent /> , document.getElementById("app"));