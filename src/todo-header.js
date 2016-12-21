/**
 * This module defines the "todo-header" custom element which extends the `<header>` element.
 *
 * @module
 */
import html from './todo-header.html';
import CustomElement from './custom-element';

const template = document.createElement( 'template' );
template.innerHTML = html;

/**
 * Class for the "todo-header" custom element. Even though this element extends the `<header>`
 * element, a base class is not passed to the `CustomElement` function because the interface
 * for `<header>` elements is `HTMLElement` (`CustomElement` uses `HTMLElement` by default):
 * https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
 */
export default class TodoHeader extends CustomElement() {
	/**
	 * Sets up a listener for the submit event to create a new todo item. An "add-todo"
	 * `CustomEvent` is dispatched when the form is submitted.
	 */
	initialize() {
		this.addEventListener( 'submit', e => {
			const input = e.target.children[ 0 ];

			// Dispatch the "add-todo" event.
			this.dispatch( 'add-todo', { title: input.value } );

			// Clear the input's value.
			input.value = '';

			e.preventDefault();
			return false;
		});
	}

	/**
	 * Renders the contents of this element.
	 */
	connectedCallback() {
		let fragment = this.cloneTemplate( template );
		this.appendChild( fragment );
	}
}

customElements.define( 'todo-header', TodoHeader, { extends: 'header' } );