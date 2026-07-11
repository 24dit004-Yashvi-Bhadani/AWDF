function Skills({skillList} ) {
    return (
            <ul>
                {skillList.map(((s)=> <li key={s}>{s}</li> ))          }
            </ul>
    );
}

export default Skills;