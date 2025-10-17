import React, { useState } from 'react'

// Define the User type
type User = {
	id: number
	username: string
}

export default function Home() {

	const [users, setUsers] = useState<User[]>([])
	const [error, setError] = useState('')

	const fetchUser = async () => {
		setError('')
		
		try {
			//* Calling the API test!
			const response = await fetch('http://localhost:3000/api/users')
			const data = await response.json()

			if (data.success) {
				setUsers(data.users)
			}
			else {
				setError(data.error)	
			}
		} catch (err) {
			setError('Could not fetch users, is backend connected man?')
			console.error(err)
		}
	}

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold font-montserrat mb-8">Home Page</h1>

	  {/* API response display */}
	  <div className="mt-8">
		<h2 className="text-2xl font-bold font-montserrat mb-4">API DEMO</h2>
		<p className="text-base font-montserrat mb-4">
			Click the button below to fetch users from the backend API!
		</p>
		<button
			onClick={fetchUser}
			className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
		>
			Fetch Users
		</button>

		{/* Error message */}
		{error && (
			<div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
				{error}
			</div>
		)}

		{/* Users list */}
		{users.length > 0 && (
			<div className="mt-4">
				<h3 className="text-xl font-bold mb-2">Users:</h3>
				<ul className="list-disc pl-6">
					{users.map((user) => (
						<li key={user.id} className="mb-1">
							{user.username} (ID: {user.id})
						</li>
					))}
				</ul>
			</div>
		)}
	  </div>
    </div>
  )
}
