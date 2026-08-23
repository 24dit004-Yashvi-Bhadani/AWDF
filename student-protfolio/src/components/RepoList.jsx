import { useState } from 'react'
import './RepoList.css'

function RepoList({ repos = [] }) {
    const [searchText, setSearchText] = useState('')
    const filteredRepos = repos.filter((repo) =>
        repo.name.toLowerCase().includes(searchText.toLowerCase())
    )

    return (
        <div className="container">
            <h1>Github Repositories</h1>

            <input
                type="search"
                placeholder="Search repositories"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
            />

            {filteredRepos.map((repo) => (
                <div className="subDiv" key={repo.id}>
                    <h3>{repo.name} - ⭐ {repo.stargazers_count}</h3>
                    <a href={repo.html_url}
                        target='_blank'
                        rel="noreferrer"
                    >
                        {repo.html_url}
                    </a>
                </div>
            ))}

        </div>

    )


}

export default RepoList;