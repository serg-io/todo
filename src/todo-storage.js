/**
 * This module defines the `<todo-storage>` custom element.
 *
 * @module
 */
import CustomElement from './custom-element';

const DEFAULT_NAME = 'todo-storage';

/**
 * Class for the <todo-storage> custom element.
 */
export default class TodoStorage extends CustomElement() {
	/**
	 * Sets up the local storage when the <todo-storage> element is created.
	 *
	 * @param {string} [name] Name of the local storage item in which all todos will be stored. If
	 *     not given, it will use the value of the "name" attribute. If it doesn't have a "name"
	 *     attribute, it uses "todo-storage" by default.
	 */
	initialize( name ) {
		let liveTodos;

		const localStorage = window.localStorage;

		name || ( name = this.getAttribute( 'name' ) ) || ( name = DEFAULT_NAME );

		/**
		 * Gets the todos from localStorage.
		 *
		 * @returns {object[]} Current array of todos.
		 */
		this.getLocalStorage = () => {
			return liveTodos || JSON.parse( localStorage.getItem( name ) || '[]' );
		};

		/**
		 * Saves an array of todos into localStorage.
		 *
		 * @param {object[]} todos Array of todos to save.
		 */
		this.setLocalStorage = ( todos ) => {
			localStorage.setItem( name, JSON.stringify( liveTodos = todos ) );
		};
	}

	/**
	 * Dispatches "storage-connected" and "count-updated" events when the `<todo-storage>`
	 * element is connected.
	 */
	connectedCallback() {
		this.find().then( todos => this.dispatch( 'storage-connected', todos ) );
		this.dispatchCountUpdated();
	}

	/**
	 * Find all the todo items that match the given `query` object.
	 *
	 * @param {object} query
	 * @returns {Promise} The returned promise is resolved with an array of todo items/objects.
	 */
	find( query ) {
		const todos = this.getLocalStorage();
		query || ( query = {} );

		return Promise.resolve(
			todos.filter( todo => {
				for ( let k in query ) {
					if ( query[ k ] !== todo[ k ] ) {
						return false;
					}
				}
				return true;
			})
		);
	}

	/**
	 * Updates a todo item and dispatches "todo-update" and "count-updated" events after the
	 * update is saved.
	 *
	 * @param {object} update The todo item to update.
	 * @returns {Promise} The returned promise is resolved with the updated item or rejected if
	 *     the given item doesn't exist.
	 */
	updateTodo( update ) {
		let item;

		const id = update.id,
			todos = this.getLocalStorage();

		for ( let i = 0, len = todos.length, k; i < len; i++ ) {
			if ( todos[ i ].id === id ) {
				item = todos[ i ];
				for ( k in update ) {
					item[ k ] = update[ k ];
				}
				break;
			}
		}

		if ( item ) {
			this.setLocalStorage( todos );
			this.dispatch( 'todo-updated', item );
			this.dispatchCountUpdated();
		}

		return item ? Promise.resolve( item ) : Promise.reject( update );
	}

	/**
	 * Adds a todo item with the given `title` to `localStorage`. Dispatches "todo-added" and
	 * "count-updated" events after adding the new item into `localStorage`.
	 *
	 * @param {string} title The title for the new todo item.
	 * @returns {Promise} The returned promise is resolved with the new todo item/object.
	 */
	addTodo( title ) {
		const item = {
				title,
				id: Date.now(),
				completed: false
			},
			todos = this.getLocalStorage();

		if ( typeof title !== 'string' || title.trim().length === 0 ) {
			throw new Error( 'Cannot create a todo item with an empty title.' );
		}

		todos.push( item );
		this.setLocalStorage( todos );

		this.dispatch( 'todo-added', item );
		this.dispatchCountUpdated();

		return Promise.resolve( item );
	}

	/**
	 * Removes the todo item with the given `id` from `localStorage`. Dispatches "todo-removed" and
	 * "count-updated" events after the item is removed.
	 *
	 * @param {number} id The todo item ID.
	 * @returns {Promise} The returned promise is resolved (with the array of todos) after the
	 *     item is removed.
	 */
	removeTodo( id ) {
		const todos = this.getLocalStorage().filter( todo => {
			return todo.id !== id;
		});

		this.setLocalStorage( todos );

		this.dispatch( 'todo-removed', { id } );
		this.dispatchCountUpdated();

		return Promise.resolve( todos );
	}

	/**
	 * Counts the number of todo items.
	 *
	 * @returns {Promise} The returned promise is resolved with the number of active, completed,
	 *     and total items.
	 */
	count() {
		return new Promise( resolve => {
			this.find().then( todos => {
				let completed = 0;
				const total = todos.length;

				for ( let i = 0; i < total; i++ ) {
					if ( todos[ i ].completed ) {
						completed++;
					}
				}

				resolve({
					total,
					completed,
					active: total - completed
				});
			});
		});
	}

	/**
	 * Dispatches a "count-update" event.
	 */
	dispatchCountUpdated() {
		this.count().then( detail => this.dispatch( 'count-updated', detail ) );
	}
}

customElements.define( 'todo-storage', TodoStorage );