function NavBar({activeSection}){
    return(
        <nav>
        <a href="#about"  style={{color:activeSection=== 'Home' ? 'grey': 'white' }}  >About</a>
        { ' | '}
        <a href="#skilks"  style={{color: activeSection === 'Skills' ?'grey': 'white' }}  >Skills</a>
        {' | '}
        <a href="#footer"  style={{color: activeSection === 'Footer' ?'grey': 'white' }}  >Foooter</a>

        </nav>
    )
}

export default NavBar ;