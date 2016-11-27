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

package parser;

import cloudDSF.CloudDSF;
import cloudDSF.Decision;
import cloudDSF.DecisionPoint;
import cloudDSF.Outcome;
import cloudDSF.OutcomeRelation;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Comment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.Iterator;

/**
 * Reads knowledge base (excel file) and collects all data necessary for the CloudDSFPlus.
 *
 * @author Metz
 */
public class CloudDSFPlusParser {

    private static final String DECISION_RELATION_INFLUENCING = "Influencing";
    private static final String DECISION_RELATION_AFFECTING = "Affecting";
    private static final String DECISION_RELATION_BINDING = "Binding";
    private static final String DECISION_RELATION_REQUIRING = "Requiring";

    private final CloudDSF cdsf;
    private final XSSFWorkbook workbook;

    /**
     * Default constructor setting workbook and new cloudDSFPlus object.
     *
     * @param workbook excel file containing knowledge base
     */
    public CloudDSFPlusParser(XSSFWorkbook workbook) {
        // create new CloudDSF object with information for the CloudDSFPlus
        this.cdsf = new CloudDSF(0, "root", "CloudDSF+ v2.0");
        cdsf.setAbbrev("CDSF+ v2.0");
        cdsf.setDescription("CDSF+ v2.0 knowledge base containing decision points, decisions and their outcomes.");
        this.workbook = workbook;
    }

    /**
     * Retrieves the knowledge base for the CloudDSFPlus from the sheet and the relations.
     *
     * @return CloudDSFPlus object
     */
    public CloudDSF readExcel() {
        // Get desired sheet from the workbook
        XSSFSheet sheet = workbook.getSheet("Knowledge Base");

        //LOG
        System.out.println("SHEET - 'Knowledge Base'");
        System.out.println("########################");
        //LOG

        // setup variable
        String decisionName = "";
        String decisionPointName = "";

        DecisionPoint decisionPoint;
        Decision decision;
        Outcome outcome;

        int decisionPointId = 0;
        int decisionId = 0;
        int outcomeId = 0;

        // iterate over all rows skipping headline
        for (int j = 1; j <= sheet.getLastRowNum(); j++) {
            // row 2 gets selected
            Row row = sheet.getRow(j);
            // select cell A
            int dpCol = 0;
            Cell cell = row.getCell(dpCol);
            // if not empty than new decision Point
            int outCol = 2;
            int decCol = 1;
            if (!cell.getStringCellValue().equals("")) {
                //LOG
                System.out.println("decisionPointName = " + cell.getStringCellValue());
                //LOG

                decisionPointId++;
                decisionId = decisionPointId * 100 + 1;
                outcomeId = decisionId * 100 + 1;
                decisionPointName = cell.getStringCellValue().trim();
                // create new DecisionPoint
                decisionPoint = generateDecisionPoint(cell, decisionPointId, row);
                // create new Decision
                Cell decisionCell = row.getCell(decCol);
                decisionName = decisionCell.getStringCellValue();
                decision = generateDecision(decisionCell, decisionId, decisionPointId, row);
                if (decision != null) {
                    // create new outcome
                    Cell outcomeCell = row.getCell(outCol);

                    //LOG
                    System.out.println("--> Outcome cell = " + outcomeCell.getStringCellValue());
                    //LOG

                    outcome = generateOutcome(outcomeCell, decisionId, decisionPointId, outcomeId, row);
                    if (outcome != null) {
                        // add outcome to decision
                        decision.addOutcome(outcome);

                        if (decisionPoint != null) {
                            // add decision to decisionPoint
                            decisionPoint.addDecision(decision);
                            // add decisionPoint to cloudDSFPlus
                            cdsf.addDecisionPoint(decisionPoint);
                        } else {
                            //LOG
                            System.out.println("--> decisionPoint = null");
                            //LOG
                        }

                        //LOG
                        System.out.println("--> Outcome = " + outcome.toString());
                        //LOG
                    } else {
                        //LOG
                        System.out.println("--> Outcome = null");
                        //LOG
                    }
                }
            } else {
                // Select Cell B
                Cell decisionCell = row.getCell(decCol);
                // if text than new decision
                if (!decisionCell.getStringCellValue().equals("")) {
                    //LOG
                    System.out.println("decisionCell = " + decisionCell.getStringCellValue());
                    //LOG

                    decisionId++;
                    outcomeId = decisionId * 100 + 1;
                    // create new decision
                    decisionName = decisionCell.getStringCellValue();
                    decision = generateDecision(decisionCell, decisionId, decisionPointId, row);
                    if (decision != null) {
                        // create new outcome
                        Cell outcomeCell = row.getCell(outCol);

                        //LOG
                        System.out.println("outcomeCell = " + outcomeCell.getStringCellValue());
                        //LOG

                        outcome = generateOutcome(outcomeCell, decisionId, decisionPointId, outcomeId, row);
                        if (outcome != null) {
                            // add outcome to decision
                            decision.addOutcome(outcome);
                            // add decision to current decision point
                            cdsf.getDecisionPoint(decisionPointName).addDecision(decision);

                            //LOG
                            System.out.println("--> Outcome = " + outcome.toString());
                            //LOG
                        } else {
                            //LOG
                            System.out.println("--> Outcome = null");
                            //LOG
                        }
                    }
                } else {
                    // if no text in dp or d than new outcome
                    outcomeId++;
                    // create new outcome
                    Cell outcomeCell = row.getCell(outCol);

                    //LOG
                    System.out.println("outcomeCell = " + outcomeCell.getStringCellValue());
                    //LOG

                    outcome = generateOutcome(outcomeCell, decisionId, decisionPointId, outcomeId, row);
                    if (outcome != null) {
                        //LOG
                        System.out.println("--> Outcome = " + outcome.toString());
                        //LOG

                        // add outcome to current decision in current decision point
                        DecisionPoint curDecisionPoint = cdsf.getDecisionPoint(decisionPointName);
                        if (curDecisionPoint != null) {
                            Decision curDecision = curDecisionPoint.getDecision(decisionName);
                            if (curDecision != null) {
                                curDecision.addOutcome(outcome);
                            } else {
                                System.out.println("-WARNING- current decision = null");
                            }
                        } else {
                            System.out.println("-WARNING- current decision point = null");
                        }
                    } else {
                        //LOG
                        System.out.println("--> Outcome = null");
                        //LOG
                    }
                }
            }
        }
        // retrieve relations
        readInfluencingRelations();
        readRequiringRelations();
        readOutcomeRelations();
        // sorting
        cdsf.sortEntities();
        cdsf.sortLists();
        return cdsf;

    }

    /**
     * Generates a new outcome.
     *
     * @param cell            current cell in the excel file
     * @param decisionId      id of the decision
     * @param decisionPointId id of the decision point
     * @param outcomeId       id of the outcome
     * @param row             current row in the excel file
     * @return
     */
    private Outcome generateOutcome(Cell cell, int decisionId, int decisionPointId, int outcomeId,
                                    Row row) {
        String label = cell.getStringCellValue();

        // column "F": "Description Outcome"
        String description = row.getCell(5).getStringCellValue();

        // column "L": "URL Outcome"
        String url = "";
        Cell urlCell = row.getCell(11);
        if (urlCell != null) {
            url = urlCell.getStringCellValue();
        }

        // column "M": "Service Type Outcome"
        String serviceType = "";
        Cell serviceTypeCell = row.getCell(12);
        if (serviceTypeCell != null) {
            serviceType = serviceTypeCell.getStringCellValue();
        }

        Comment cellComment = cell.getCellComment();
        if (cellComment != null) {
            String abbrev = cellComment.getString().getString();

            //LOG
            System.out.println("--> Outcome --> abbrev = " + abbrev);
            //LOG

            return new Outcome(label, outcomeId, decisionPointId, decisionId, description, null, abbrev, url, serviceType);
        } else {
            //LOG
            System.out.println("--> Cell --> Comment = null");
            //LOG

            return null;
        }
    }

    /**
     * Generates a new decision.
     *
     * @param cell            current cell in the excel file
     * @param decisionId      id of the decision
     * @param decisionPointId id of the decision point
     * @param row             current row in the excel file
     * @return
     */
    private Decision generateDecision(Cell cell, int decisionId, int decisionPointId, Row row) {
        Comment cellComment = cell.getCellComment();
        if (cellComment != null) {
            String label = cell.getStringCellValue();
            int decClassCol = 7;
            String classification = row.getCell(decClassCol).getStringCellValue();
            int decDescCol = 4;
            String description = row.getCell(decDescCol).getStringCellValue();
            String abbrev = cellComment.getString().getString();
            return new Decision(label, decisionId, decisionPointId, decisionPointId, classification,
                    description, null, abbrev);
        } else {
            return null;
        }
    }

    /**
     * Generates a new decision point.
     *
     * @param cell            current cell in the excel file
     * @param decisionPointId id of the decision point
     * @param row             current row in the excel file
     * @return
     */
    private DecisionPoint generateDecisionPoint(Cell cell, int decisionPointId, Row row) {
        Comment cellComment = cell.getCellComment();
        if (cellComment != null) {
            String label = cell.getStringCellValue();
            int dpClassCol = 6;
            String classification = row.getCell(dpClassCol).getStringCellValue();
            int dpDescCol = 3;
            String description = row.getCell(dpDescCol).getStringCellValue();
            String abbrev = cellComment.getString().getString();
            return new DecisionPoint(label, decisionPointId, decisionPointId, classification, description,
                    null, abbrev);
        } else {
            return null;
        }
    }

    /**
     * Retrieves influencing relations between decisions.
     */
    private void readInfluencingRelations() {
        XSSFSheet sheet = workbook.getSheet("Decision Level");

        //LOG
        System.out.println("SHEET - 'Decision Level'");
        System.out.println("########################");
        //LOG

        // Column B has name of start Decision
        int startDecisionColumn = 1;
        // Row 1 has names of endDecision
        Row endDecisionRow = sheet.getRow(1);
        // Iterate over all rows starting at 3
        Iterator<Row> rows = sheet.rowIterator();
        while (rows.hasNext()) {
            XSSFRow row = (XSSFRow) rows.next();
            // select cell C
            Iterator<Cell> cells = row.cellIterator();
            // Iterate of all cells in row
            while (cells.hasNext()) {
                XSSFCell cell = (XSSFCell) cells.next();
                String relationType = cell.getStringCellValue().trim();

                if (!relationType.isEmpty()) {
                    //LOG
                    System.out.println("relationType = " + relationType);
                    //LOG

                    if (relationType.equals(DECISION_RELATION_INFLUENCING) || relationType.equals(DECISION_RELATION_AFFECTING)
                            || relationType.equals(DECISION_RELATION_BINDING)) {
                        // if type of relationship matches predefined values get names of the two participating
                        // decisions
                        String startDecision = row.getCell(startDecisionColumn).getStringCellValue();
                        String endDecision = endDecisionRow.getCell(cell.getColumnIndex()).getStringCellValue();

                        //LOG
                        System.out.println("--> startDecision = " + startDecision);
                        System.out.println("--> endDecision = " + endDecision);
                        //LOG

                        // add decision relation to cloudDSFPlus
                        cdsf.setDecisionRelation(startDecision, endDecision, relationType);
                    } else {
                        //LOG
                        System.out.println("-WARNING- unsupported relationType");
                        //LOG
                    }
                }
            }
        }
    }

    /**
     * Retrieves requiring relations between decisions.
     */
    private void readRequiringRelations() {
        XSSFSheet sheet = workbook.getSheet("Required Level");

        //LOG
        System.out.println("SHEET - 'Required Level'");
        System.out.println("########################");
        //LOG

        // Column B has name of start Decision
        int startDecisionColumn = 1;
        // Row 1 has names of endDecision
        Row endDecisionRow = sheet.getRow(1);
        // Iterate over all rows starting at 3
        Iterator<Row> rows = sheet.rowIterator();
        while (rows.hasNext()) {
            XSSFRow row = (XSSFRow) rows.next();
            Iterator<Cell> cells = row.cellIterator();
            while (cells.hasNext()) {
                XSSFCell cell = (XSSFCell) cells.next();
                String relationType = cell.getStringCellValue().trim();

                if (!relationType.isEmpty()) {
                    //LOG
                    System.out.println("relationType = " + relationType);
                    //LOG

                    if (relationType.equals(DECISION_RELATION_REQUIRING)) {
                        // if requiring relationship is denoted get names of both decisions
                        String startDecision = row.getCell(startDecisionColumn).getStringCellValue();
                        String endDecision = endDecisionRow.getCell(cell.getColumnIndex()).getStringCellValue();

                        //LOG
                        System.out.println("--> startDecision = " + startDecision);
                        System.out.println("--> endDecision = " + endDecision);
                        //LOG

                        // add requiring relation to cloudDSFPlus
                        cdsf.setDecisionRelation(startDecision, endDecision, relationType);
                    } else {
                        //LOG
                        System.out.println("-WARNING- unsupported relationType");
                        //LOG
                    }
                }
            }
        }
    }

    /**
     * Retrieves relations between outcomes.
     */
    private void readOutcomeRelations() {
        XSSFSheet sheet = workbook.getSheet("Outcome Level");

        //LOG
        System.out.println("SHEET - 'Outcome Level'");
        System.out.println("#######################");
        //LOG

        //LOG

        // Column B has name of start Decision
        int startOutcomeColumn = 1;
        // Row 1 has names of endDecision
        Row endOutcomeRow = sheet.getRow(0);
        // Iterate over all rows
        Iterator<Row> rows = sheet.rowIterator();
        while (rows.hasNext()) {
            XSSFRow row = (XSSFRow) rows.next();
            Iterator<Cell> cells = row.cellIterator();
            // Iterate over all cells
            while (cells.hasNext()) {
                XSSFCell cell = (XSSFCell) cells.next();
                String relationType = cell.getStringCellValue().trim();

                if (!relationType.isEmpty()) {
                    //LOG
                    System.out.println("relationType = " + relationType);
                    //LOG

                    // read explanation from comment
                    String explanation = "";

                    Comment cellComment = cell.getCellComment();
                    if (cellComment != null) {
                        explanation = cellComment.getString().getString();
                    }

                    if (OutcomeRelation.verifyType(relationType)) {
                        // if relationship is denoted get names of both outcomes
                        String startOutcome = row.getCell(startOutcomeColumn).getStringCellValue();
                        String endOutcome = endOutcomeRow.getCell(cell.getColumnIndex()).getStringCellValue();

                        //LOG
                        System.out.println("--> startOutcome = " + startOutcome);
                        System.out.println("--> endOutcome = " + endOutcome);
                        System.out.println("--> explanation = " + explanation);
                        //LOG

                        // add new outcome relation to cloudDSFPlus
                        cdsf.createOutcomeRelation(startOutcome, endOutcome, relationType, explanation);
                    } else {
                        //LOG
                        System.out.println("-WARNING- unsupported relationType");
                        //LOG
                    }
                }
            }
        }
    }
}
