import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./HomePage.scss";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <Container fluid className="homepage-container">
      <Row className="justify-content-center">
        <Col lg={7} md={8} className="left-section">
          <div className="section-1 d-flex justify-content-between align-items-center">
            <h2 className="browse-library-text">{t("browseLibrary")}</h2>
            <Button variant="primary" className="browse-button">
              {t("explore")}
            </Button>
          </div>

          <div className="section-2 mt-5">
            <Row className="mb-4">
              <Col xs={6} className="part part-left">
                <div className="green-line mb-3"></div>
                <p className="part-title">{t("wayOfBoddhisattva")}</p>
              </Col>

              <Col xs={6} className="part part-right">
                <div className="red-line mb-3"></div>
                <p className="part-title">{t("liturgy")}</p>
                <p className="part-subtitle">{t("prayersAndRituals")}</p>
              </Col>
            </Row>

            <Row>
              <Col xs={6} className="part part-left">
                <div className="red-line mb-3"></div>
                <p className="part-title">{t("buddhavacana")}</p>
              </Col>
            </Row>
          </div>
        </Col>

        <Col lg={5} md={4} className="right-section d-flex flex-column">
          <h2 className="right-title">{t("livingLibrary")}</h2>
          <hr className="right-divider" />
          <p className="right-paragraph">
            {t("livingLibraryDescription")}
            <span className="learn-more"> {t("learnMore")}</span>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;