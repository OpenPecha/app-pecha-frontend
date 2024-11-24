import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap"; // Import React Bootstrap components
import "./HomePage.scss"; // Import custom styles for finer control

const HomePage = () => {
    return (
        <Container fluid className="homepage-container">
            <Row className="justify-content-center">
                {/* Left Section (70%) */}
                <Col lg={7} md={8} className="left-section">
                    {/* Section 1 */}
                    <div className="section-1 d-flex justify-content-between align-items-center">
                        <h2 className="browse-library-text">Browse the Library</h2>
                        <Button variant="primary" className="browse-button">Explore</Button>
                    </div>

                    {/* Section 2 */}
                    <div className="section-2 mt-5">
                        <Row className="mb-4">
                            {/* Part 1 (Left Side) */}
                            <Col xs={6} className="part part-left">
                                <div className="green-line mb-3"></div>
                                <p className="part-title">The Way of the Boddhisattva</p>
                            </Col>

                            {/* Part 2 (Right Side) */}
                            <Col xs={6} className="part part-right">
                                <div className="red-line mb-3"></div>
                                <p className="part-title">Liturgy</p>
                                <p className="part-subtitle">Prayers and rituals</p>
                            </Col>
                        </Row>

                        <Row>
                            {/* Part 1 (Second Row - Left Side) */}
                            <Col xs={6} className="part part-left">
                                <div className="red-line mb-3"></div>
                                <p className="part-title">Buddhavacana</p>
                            </Col>
                        </Row>
                    </div>
                </Col>

                {/* Right Section (30%) */}
                <Col lg={5} md={4} className="right-section d-flex flex-column">
                    <h2 className="right-title">A Living Library of Buddhist Text</h2>
                    <hr className="right-divider" />
                    <p className="right-paragraph">
                        Pecha connects users to Buddhist scriptures in various languages. Search a verse to explore its origins, interpretations, and related texts. Engage with the community by sharing insights and learning from others through sheets and topics.
                        <span className="learn-more"> Learn More ›</span>
                    </p>
                </Col>
            </Row>
        </Container>
    );
};

export default HomePage;