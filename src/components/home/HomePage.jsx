import { Button, Col, Container, Row } from "react-bootstrap";
import "./HomePage.scss";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslate } from "@tolgee/react";

const HomePage = () => {
    const { t } = useTranslate();
    const {user} = useAuth0();
    console.log(user)

    return (
        <Container fluid className="homepage-container">
            <Row className="justify-content-center">
                <Col lg={7} md={8} className="left-section">
                    <div className="section-1 d-flex justify-content-between align-items-center">
                        <h2 className="title browse-library-text">{ t("home.browse_text") }</h2>
                        <Button className="browse-button">
                            { t("side_nav.explore_collections") }
                        </Button>
                    </div>

                    <div className="section-2 mt-5">
                        <Row className="mb-4">
                            <Col xs={6} className="part part-left">
                                <div className="green-line mb-3">{ t("content.title.words_of_buddha") }</div>
                                <p className="subtitle part-title">{ t("content.subtitle.words_of_buddha") }</p>
                            </Col>

                            <Col xs={6} className="part part-right">
                                <div className="red-line mb-3"></div>
                                <p className="subtitle part-title">{ t("content.title.liturgy") }</p>
                                <p className="subtitle part-subtitle">{ t("content.subtitle.prayers_rutuals") }</p>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={6} className="part part-left">
                                <div className="red-line mb-3">{ t("content.title.Buddhavacana") }</div>
                                <p className="subtitle part-title">{ t("content.subtitle.buddhavacana") }</p>
                            </Col>
                        </Row>
                    </div>
                </Col>

                <Col lg={5} md={4} className="right-section d-flex flex-column">
                    <h2 className="title right-title">{ t("side_nav.about_pecha_title") }</h2>
                    <hr className="right-divider"/>
                    <p className="subtitle  right-paragraph">
                        { t("side_nav.about_pecha_description") }
                        <span className="subtitle learn-more"> { t("common.learn_more") }</span>
                    </p>
                </Col>
            </Row>
        </Container>
    );
};

export default HomePage;
