import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import 'scss/base.scss';
import 'scss/Test/index.scss';

class PageComponent extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="m-test">
				<div className="m-header"></div>
				<div className="m-body">
					test Component to implement
				</div>
				<div className="m-footer"></div>
			</div>
		)
	}
}

ReactDOM.render(<PageComponent /> , document.getElementById("app"));