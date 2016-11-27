/*
 * Copyright 2015 Balduin Metz
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package cloudDSF;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.Before;
import org.junit.Test;
import parser.CloudDSFPlusParser;
import parser.JsonWriter;

import java.io.IOException;
import java.io.InputStream;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 * Testing and development purposes to check the knowledge base. Is not necessary anymore.
 *
 * @author Metz
 */
public class CloudDSFTest {
    private CloudDSF cdsf;


    /**
     * Fetches new instance of the cloudDSF object prior to each test.
     *
     * @throws Exception Thrown if reading of excel file fails
     */
    @Before
    public void setUp() throws Exception {
        String filePath = "KnowledgeBase.xlsx";
        XSSFWorkbook workbook = null;
        // Create Workbook instance holding reference to .xlsx file
        InputStream in = JsonWriter.class.getClassLoader().getResourceAsStream(filePath);
        try {
            workbook = new XSSFWorkbook(in);
        } catch (IOException e) {
            e.printStackTrace();
        }
        CloudDSFPlusParser cloudDSFPlusParser = new CloudDSFPlusParser(workbook);
        cdsf = cloudDSFPlusParser.readExcel();
    }

    @Test
    public void testCheckRelTypesDecisions() {
        assertTrue(cdsf.checkRelTypesDecisions());
        // insert decision relation with wrong relationship type
        cdsf.setDecisionRelation("Select Application Layer", "Select Cloud Deployment Model", "test"
        );
        assertFalse(cdsf.checkRelTypesDecisions());
    }

    @Test
    public void testCheckRelTypesOutcomes() {
        assertTrue(cdsf.checkRelTypesOutcomes());
        // insert outcome relation with wrong relationship type "test"
        cdsf.createOutcomeRelation("Presentation Layer", "Public Cloud", "test", "");
        assertFalse(cdsf.checkRelTypesOutcomes());
    }

    @Test
    public void testCheckDecRelComb() {
        assertTrue(cdsf.checkDecRelComb());
        // insert two decision relations between same decisions with non
        // combinatorial relationship types
        cdsf.setDecisionRelation("Select Application Layer", "Select Cloud Deployment Model",
                DecisionRelation.INFLUENCING);
        cdsf.setDecisionRelation("Select Application Layer", "Select Cloud Deployment Model",
                DecisionRelation.AFFECTING);
        assertFalse(cdsf.checkDecRelComb());
    }

    @Test
    public void testCheckOutRelAmountForDecRel() {
        assertTrue(cdsf.checkOutRelAmountForDecRel());
        // add additional decision relation without outcome relations
        cdsf.setDecisionRelation("Select Application Layer", "Select Cloud Deployment Model",
                DecisionRelation.INFLUENCING);
        assertFalse(cdsf.checkOutRelAmountForDecRel());
    }

    @Test
    public void testCheckOutRelAmountForDecRel2() {
        assertTrue(cdsf.checkOutRelAmountForDecRel());
        // additional outcome relation thus one relation is too much
        cdsf.createOutcomeRelation("Application Component", "Presentation Layer", OutcomeRelation.EXCLUDING, "");
        assertFalse(cdsf.checkOutRelAmountForDecRel());
    }

    @Test
    public void testCheckDecRelForOutRel() {
        assertTrue(cdsf.checkDecRelForOutRel());
        // add new outcome relation where no decision relation exists.
        cdsf.createOutcomeRelation("Presentation Layer", "Public Cloud", OutcomeRelation.INCLUDING, "");
        assertFalse(cdsf.checkDecRelForOutRel());
    }

    @Test
    public void testCheckAffBinDecRelations() {
        assertTrue(cdsf.checkAffBinDecRelations(DecisionRelation.AFFECTING, DecisionRelation.BINDING));
        assertTrue(cdsf.checkAffBinDecRelations(DecisionRelation.BINDING, DecisionRelation.AFFECTING));
        // add new binding relation without corresponding affecting relation
        cdsf.setDecisionRelation("Select Cloud Vendor", "Select Application Components", DecisionRelation.BINDING);
        assertFalse(cdsf.checkAffBinDecRelations(DecisionRelation.BINDING, DecisionRelation.AFFECTING));
        // add new affecting relation without corresponding binding relation
        cdsf.setDecisionRelation("Select Application Layer", "Select Cloud Vendor", DecisionRelation.AFFECTING);
        assertFalse(cdsf.checkAffBinDecRelations(DecisionRelation.AFFECTING, DecisionRelation.BINDING));
    }

    @Test
    // TODO: 24.10.16 reimplement
    public void testCheckInAOutRelations() {
//        assertTrue(cdsf.checkInAOutRelations(OutcomeRelation.INCLUDING, OutcomeRelation.ALLOWING, OutcomeRelation.INCLUDING));
//        assertTrue(cdsf.checkInAOutRelations(OutcomeRelation.ALLOWING, OutcomeRelation.INCLUDING, OutcomeRelation.ALLOWING));
//        // add two new contradicting outcome relations a to ex
//        cdsf.createOutcomeRelation("Application Component", "Public Cloud", OutcomeRelation.ALLOWING, "", "");
//        cdsf.createOutcomeRelation("Public Cloud", "Application Component", OutcomeRelation.EXCLUDING, "", "");
//        assertTrue(cdsf.checkInAOutRelations(OutcomeRelation.INCLUDING, OutcomeRelation.ALLOWING, OutcomeRelation.INCLUDING));
//        assertFalse(cdsf.checkInAOutRelations(OutcomeRelation.ALLOWING, OutcomeRelation.ALLOWING, OutcomeRelation.INCLUDING));
//        // add two new contradicting outcome relations in to ex
//        cdsf.createOutcomeRelation("Application Component", "Private Cloud", OutcomeRelation.INCLUDING, "", "");
//        cdsf.createOutcomeRelation("Private Cloud", "Application Component", OutcomeRelation.EXCLUDING, "", "");
//        assertFalse(cdsf.checkInAOutRelations(OutcomeRelation.INCLUDING, OutcomeRelation.ALLOWING, OutcomeRelation.INCLUDING));
//        assertFalse(cdsf.checkInAOutRelations(OutcomeRelation.ALLOWING, OutcomeRelation.ALLOWING, OutcomeRelation.INCLUDING));
    }

    @Test
    public void testCheckXOROutcomesSelf() {
        assertTrue(cdsf.checkXOROutcomes());
        // add self referencing outcome
        cdsf.createOutcomeRelation("Application Component", "Application Component", OutcomeRelation.ALLOWING, "");
        assertFalse(cdsf.checkXOROutcomes());
    }

    @Test
    public void testCheckXOROutcomes() {
        assertTrue(cdsf.checkXOROutcomes());
        // add relation between two outcomes of same decision
        cdsf.createOutcomeRelation("Application Component", "Middleware Component", OutcomeRelation.ALLOWING, "");
        assertFalse(cdsf.checkXOROutcomes());
    }

    @Test
    public void testCheckSingleOutcomeRel() {
        assertTrue(cdsf.checkSingleOutcomeRel());
        // add two relations between the same outcomes
        cdsf.createOutcomeRelation("Application Component", "Public Cloud", OutcomeRelation.ALLOWING, "");
        cdsf.createOutcomeRelation("Application Component", "Public Cloud", OutcomeRelation.EXCLUDING, "");
        assertFalse(cdsf.checkSingleOutcomeRel());
    }
}
