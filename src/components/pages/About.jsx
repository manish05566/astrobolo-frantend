import React from 'react'
import AstrologerCard from './AstrologerChat/AstrologerCard.jsx'
import ExpertSearch from './AstrologerChat/ExpertSearch.jsx'
function About() {
    return (
        <div className='App-headerd'>
            <h3 className='text-3xl font-bold underline text-red-500'>About</h3>
            <ExpertSearch />
            <AstrologerCard />
        </div>
    )
}

export default About
