export default class BaseAdaptor {
	constructor(data = {}) {
		this.data = data;
	}

	getData() {
		return this.data;
	}

	init() {
		this.data = this.preProcessData();
		this.data = this.transform();
		this.data = this.postProcessData();
	}

	preProcessData() {
		throw new Error('please overwrite this pre proccessing method in SubClass');
	}

	transform(data) {
		throw new Error('please overwrite this transforming method in SubClass');
	}

	postProcessData() {
		throw new Error('please overwrite this post proccessing method in SubClass');
	}
}