function errorMessage({message, onRetry}){
    return(
        <div className="error-box">
            <p>Something went wrong: {message}</p>
            {onRetry && <button onClick={onRetry}>Retry</button>}
        </div> 
    )
}

export default errorMessage;