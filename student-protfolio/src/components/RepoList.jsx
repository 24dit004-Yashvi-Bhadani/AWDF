import './RepoList.css'

function RepoList({repos= []}){
    return (
        <div className="container">
            <h1>Github Repositories</h1>
           
            {repos.map((repo)=>(
                <div className="subDiv" key={repo.id}>
                    <h3>{repo.name}</h3>
                    <a href={repo.html_url}
                        target='_blank'
                        rel="noreferrer"
                    >
                        {repo.html_url}
                    </a>
                    <p >⭐ {repo. stargazers_count}</p>
                </div>
            ))}
           
        </div>

    )
   

}

export default RepoList;