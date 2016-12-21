/**
 * This module defines the `<todo-app>` custom element.
 *
 * @module
 */
import html from './todo-app.html';
import 'todomvc-app-css/index.css';
import CustomElement from './custom-element';

// Import custom elements used in the `<todo-app>`.
import './todo-storage';
import './todo-header';
import './todo-list';
import './todo-footer';

const template = document.createElement( 'template' );
template.innerHTML = html;

/**
 * Class for the `<todo-app>` custom elements.
 */
export default class TodoApp extends CustomElement() {
	/**
	 * Convenience property to access the `<todo-storage>` element.
	 */
	get store() {
		return this._store || ( this._store = this.querySelector( 'todo-storage' ) );
	}

	/**
	 * Convenience property to access the `<section is="todo-list">` element.
	 */
	get list() {
		return this._list || ( this._list = this.querySelector( '[is="todo-list"]' ) );
	}

	/**
	 * Called when the element is instantiated. It adds several event listeners to `this` element.
	 */
	initialize() {
		// Add a todo item to `<todo-storage>` when the user creates a new todo.
		this.addEventListener( 'add-todo', ({ detail: item }) => this.store.addTodo( item.title ) );

		// Display the todo item after it has been added to the `<todo-storage>`.
		this.addEventListener( 'todo-added', ({ detail: item }) => this.list.addTodo( item ) );


		// Remove a todo item from `<todo-storage>` when the user clicks the delete button.
		this.addEventListener( 'remove-todo', ({ detail: it }) => this.store.removeTodo( it.id ) );

		// Remove a todo item from the screen after it has been removed from the `<todo-storage>`.
		this.addEventListener( 'todo-removed', ({ detail: it }) => this.list.removeTodo( it.id ) );


		// Save a change to `<todo-storage>` when the user modifies a todo item.
		this.addEventListener( 'update-todo', ({ detail: item }) => this.store.updateTodo( item ) );

		// Update a todo item in the screen after it has been updated in `<todo-storage>`.
		this.addEventListener( 'todo-updated', ({ detail: item }) => this.list.updateTodo( item ) );


		// Change all items to active or completed when the user clicks the toggle button.
		this.addEventListener( 'toggle-all', e => this.toggleAll( e ) );

		// Remove all completed items from `<todo-storage>` when the user clicks "Clear Completed"
		this.addEventListener( 'clear-completed', e => this.clearCompleted( e ) );

		// Render the list of todos when the `<todo-storage>` is connected.
		this.addEventListener( 'storage-connected', e => this._render( e ), { once: true } );
	}

	/**
	 * Renders the contents of this element.
	 */
	connectedCallback() {
		let fragment = this.cloneTemplate( template );
		this.appendChild( fragment );
	}

	/**
	 * Renders the list of todo items.
	 *
	 * @param {CustomEvent} event A "storage-connected" event dispatched by `<todo-storage>`.
	 * @param {object[]} event.detail All the todo items to render.
	 */
	_render({ detail: todos }) {
		this.list.render( todos );
	}

	/**
	 * Marks all todo items as either active or completed.
	 *
	 * @param {CustomEvent} event A "toggle-all" event dispatched by the "todo-list" element.
	 * @param {object} event.detail The event's detail object.
	 * @param {boolean} event.detail.completed If `true` all items will be marked as completed,
	 *     otherwise all items will be marked as active.
	 */
	toggleAll({ detail: markAs }) {
		const completed = markAs.completed;

		this.store.find({ completed: !completed }).then( items => {
			for ( let item of items ) {
				item.completed = completed;
				this.store.updateTodo( item );
			}
		});
	}

	/**
	 * Removes all **completed** todo items from the `<todo-storage>`.
	 */
	clearCompleted() {
		this.store.find({ completed: true }).then( items => {
			for ( let item of items ) {
				this.store.removeTodo( item.id );
			}
		});
	}
}

customElements.define( 'todo-app', TodoApp );