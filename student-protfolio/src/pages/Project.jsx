import { useState, useEffect } from 'react';
import '../pages/Project.css'
import Spinner from '../components/Spinner.jsx';
import RepoList from '../components/RepoList.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

function Project() {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRepos = () => {
        setLoading(true);
        setError(null);

        fetch('https://api.github.com/users/facebook/repos')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Unable to load repositories');
                }
                return response.json();
            })
            .then((data) => setRepos(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRepos();
    }, [])

    if (loading) return <Spinner />;
    if (error) return <ErrorMessage message={error} onRetry={fetchRepos} />




    return (
        <div className="project-page">
            <h1>Projects</h1>
            <p>This page shows my recent work and project highlights.</p>
            <RepoList repos={repos} />
        </div>
    )
}

export default Project