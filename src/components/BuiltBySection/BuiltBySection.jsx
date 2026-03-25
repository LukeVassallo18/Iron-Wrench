import './BuiltBySection.css';

function BuiltBySection() {
    return (
        <section className="built-by-container">
            <div className="built-by-section">
                <h2 className="built-by-title">Buily By riders, for riders</h2>
                <p className="built-by-text">Iron & Wrench Moto Co. was founded over 15 years ago by a small crew of riders who were tired of paying dealership prices for subpar work. What started as a garage operation quickly grew into the city's most trusted independent motorcycle workshop.<br></br>

                                                <br></br>Every mechanic on our team rides. That's not a marketing line — it's a hiring requirement. We believe that the people working on your machine should understand what it feels like when something isn't right at 120 km/h.<br></br>

                                                <br></br>We're certified across all major manufacturers, but our real expertise comes from tens of thousands of hours under the lift. From vintage café racers to modern supersports, if it has two wheels and an engine, we know it inside out.</p>
                
            </div>
            <div className="workshop-image">
                    <img src="/Workshop-img.png" alt="Inside the Iron & Wrench workshop" />
            </div>
        </section>
    )
}

export default BuiltBySection;