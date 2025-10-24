export interface User {
	id: number
	phone: string
	firstname: string
	lastname: string
}

export interface Store {
	id: number
	name: string
	slug: string
	logo_url: string
	user: User
}

export interface Category {
	id: number
	store_id: number
	parent_id?: number
	name: string
	description?: string
	created_at: string
	updated_at: string
	parent?: Category
	childs?: Category[]
	store?: Store
}

export interface Product {
	id: number
	category_id: number
	name: string
	description?: string
	price: number
	quantity: number
	created_at: string
	updated_at: string
	category?: Category
}

export interface AuthResponse {
	access_token: string
}

export interface Item {
	id: string
	image_url: string
	type: ItemTypes
}

export type ItemTypes = 
	'head' 
	| 'top'
  	| 'outwear'
  	| 'bottom'
  	| 'foot'
  	| 'full'
  	| 'bag'
  	| 'jewelry'
  	| 'accessory'

export interface Props {
	label: string
	type: ItemTypes
	items: Item[],
	loading: boolean
}