/**
 * This module defines the "todo-list" custom element which extends the `<section>` element.
 *
 * @module
 */
import html from './todo-list.html';
import CustomElement from './custom-element';

// Import the custom element used in the "todo-list" element.
import TodoItem from './todo-item';

const template = document.createElement( 'template' );
template.innerHTML = html;

/**
 * Class for the "todo-list" custom element. Even though this element extends the `<section>`
 * element, a base class is not passed to the `CustomElement` function because the interface
 * for `<section>` elements is `HTMLElement` (`CustomElement` uses `HTMLElement` by default):
 * https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
 */
export default class TodoList extends CustomElement() {
	/**
	 * Attributes to observe: active and completed.
	 */
	static get observedAttributes() {
		return [ 'active', 'completed' ];
	}

	/**
	 * Returns the number of **active** todo items.
	 *
	 * @returns {number}
	 */
	get active() {
		let count = this.getAttribute( 'active' );
		return /^\d+$/.test( count ) ? parseInt( count, 10 ) : 0;
	}

	/**
	 * Sets the number of **active** todo items.
	 *
	 * @param {number} count The number of active items. Must be an integer.
	 */
	set active( count ) {
		// Make sure the value of `count` is an integer.
		if ( !/^\d+$/.test( `${ count }` ) ) {
			throw new Error( 'Only integers are allowed as the number of "active" items.' );
		}

		this.setAttribute( 'active', count );
	}

	/**
	 * Returns the number of **completed** todo items.
	 *
	 * @returns {number}
	 */
	get completed() {
		let count = this.getAttribute( 'completed' );
		return /^\d+$/.test( count ) ? parseInt( count, 10 ) : 0;
	}

	/**
	 * Sets the number of **completed** todo items.
	 *
	 * @param {number} count The number of completed items. Must be an integer.
	 */
	set completed( count ) {
		// Make sure the value of `count` is an integer.
		if ( !/^\d+$/.test( `${ count }` ) ) {
			throw new Error( 'Only integers are allowed as the number of "completed" items.' );
		}

		this.setAttribute( 'completed', count );
	}

	/**
	 * Called whenever the "active" or "completed" attributes are changed. It updates the
	 * ".toggle-all" checkbox whenever the attributes are changed.
	 *
	 * @param {string} name Name of the attribute that was changed.
	 * @param old Old value.
	 * @param current New value.
	 */
	attributeChangedCallback( name, old, current ) {
		if ( !this._isConnected ) {
			return;
		}
		this.infuseElement( '.toggle-all' );
	}

	/**
	 * Renders the contents of the `<todo-app>` element.
	 */
	connectedCallback() {
		let fragment = this.cloneTemplate( template );
		this.appendChild( fragment );

		this._isConnected = true;

		// Toggle the completed attribute of all items when the ".toggle-all" checkbox if clicked.
		this.querySelector( '.toggle-all' ).addEventListener( 'click', e => this.toggleAll( e ) );
	}

	/**
	 * Dispatch a "toggle-all" `CustomEvent`. An object with a "completed" attribute is used as
	 * the detail property of the event. The value of the completed attribute is determined by the
	 * current value of the `checked` property of the ".toggle-all" checkbox.
	 *
	 * @param {MouseEvent} event The click event on the ".toggle-all" checkbox.
	 * @param {HTMLInputElement} event.target The ".toggle-all" checkbox.
	 */
	toggleAll({ target: checkbox }) {
		this.dispatch( 'toggle-all', { completed: checkbox.checked } );
	}

	/**
	 * Renders the given array of todo items.
	 *
	 * @param {object[]} todos Todo items.
	 */
	render( todos ) {
		// Empty the contents of the `<ul>` element.
		this.querySelector( 'ul' ).textContent = '';

		for ( let item of todos ) {
			this.addTodo( item );
		}
	}

	/**
	 * Add a todo item to the list (the `<ul>` element).
	 *
	 * @param {object} item The todo item.
	 * @param {number} item.id The item's id. Must be an integer.
	 * @param {string} item.title The item's title.
	 * @param {boolean} item.completed Indicates whether or not the item is completed.
	 */
	addTodo( item ) {
		let el = new TodoItem();

		el.id = item.id;
		el.title = item.title;
		el.completed = item.completed;

		this.querySelector( 'ul' ).appendChild( el );
	}

	/**
	 * Removes the item with the given ID from the list.
	 *
	 * @param {number} id The ID of the item to remove. Must be an integer.
	 */
	removeTodo( id ) {
		this.byId( id ).remove();
	}

	/**
	 * Updates a todo item by changing the "title" and "completed" attributes of the corresponding
	 * `<li is="todo-item">`.
	 *
	 * @param {object} update The todo item object.
	 * @param {number} update.id The item's ID. Must be an integer.
	 * @param {string} update.title The new title for the item.
	 * @param {boolean} update.completed The new value for the item's completed attribute.
	 */
	updateTodo( update ) {
		const id = update.id,
			el = this.byId( id );

		el.title = update.title;
		el.completed = update.completed;
	}
}

customElements.define( 'todo-list', TodoList, { extends: 'section' } );