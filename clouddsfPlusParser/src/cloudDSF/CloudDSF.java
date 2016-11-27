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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import util.CloudDSFEntityComparator;
import util.RelationComparator;

import java.util.*;

/**
 * Represents the coudDSF(Plus) object with decision points, decisions, outcomes and their
 * relations.
 *
 * @author Metz
 */

public class CloudDSF extends CloudDSFEntity {
    /**
     * Contains all decision points of the clouddsf.
     */
    private final List<DecisionPoint> decisionPoints = new ArrayList<>();
    /**
     * contains all relations between decisions (i.e. requiring, influencing, binding, affecting)
     */
    private final List<DecisionRelation> influencingDecisions = new ArrayList<>();
    /**
     * contain all relations between decisions (i.e. aff, eb, a, ex, in)
     */
    private final List<OutcomeRelation> influencingOutcomes = new ArrayList<>();
    /**
     * contains all relations between tasks and decisions, null in case of cloudDSFPlus.
     */
    private final List<TaskRelation> influencingTasks = new ArrayList<>();
    /**
     * contains all tasks of the cloudDSF null in case of the cloudDSFPlus.
     */
    private final List<Task> tasks = new ArrayList<>();
    /**
     * Contains all influecing tasks and influencing decisions to enable link array for the
     * cloudDSFVisualizations, null for cloudDSFPlus.
     */
    private final List<Relation> influencingRelations = new ArrayList<>();

    /**
     * Default constructor.
     *
     * @param id    id of CloudDSF
     * @param type  type of CloudDSF
     * @param label name of CloudDSF
     */
    public CloudDSF(int id, String type, String label) {
        super(id, type, label);
        this.setGroup("root");
    }

    /**
     * Sets relation between two decisions by retrieving their id and add new entry into
     * influencingDecisions for the CloudDSFPlus.
     *
     * @param startDecisionName name of start decision
     * @param endDecisionName   name of end decision
     * @param type              relationship type
     */
    public void setDecisionRelation(String startDecisionName, String endDecisionName, String type) {
        Decision startDecision = getDecision(startDecisionName);
        Decision endDecision = getDecision(endDecisionName);

        int source = (startDecision != null) ? startDecision.getId() : 0;
        int target = (endDecision != null) ? endDecision.getId() : 0;

        //LOG
        System.out.println("--> startDecisionId = " + source);
        System.out.println("--> endDecisionId = " + target);
        //LOG

        if (source != 0 && target != 0) {
            influencingDecisions.add(new DecisionRelation(source, target, type));
        }
    }

    /**
     * /** Sets relation between two decisions by retrieving their id and add new entry into
     * influencingDecisions for the CloudDSF.
     *
     * @param startDecisionName name of source decision
     * @param endDecisionName   name of end decision
     */
    public void setLegacyDecisionRelation(String startDecisionName, String endDecisionName) {
        Decision startDecision = getDecision(startDecisionName);
        Decision endDecision = getDecision(endDecisionName);
        if (startDecision != null && endDecision != null) {
            int source = startDecision.getId();
            int target = endDecision.getId();
            influencingDecisions.add(new DecisionRelation(source, target));
        }
    }

    /**
     * Sets relation between two outcomes by retrieving their id and adding new entry to
     * influencingOutcomes.
     * @param startOutcomeName name of source outcome
     * @param endOutcomeName   name of target outcome
     * @param type             relationship type of outcome e.g. ex, in, a
     * @param explanation      Additional info
     */
    public void createOutcomeRelation(String startOutcomeName, String endOutcomeName, String type, String explanation) {
        Outcome startOutcome = getOutcome(startOutcomeName);
        Outcome endOutcome = getOutcome(endOutcomeName);

        int source = (startOutcome != null) ? startOutcome.getId() : 0;
        int target = (endOutcome != null) ? endOutcome.getId() : 0;

        System.out.println("--> startOutcomeId = " + source);
        System.out.println("--> endOutcomeId = " + target);

        if (source != 0 && target != 0) {
            influencingOutcomes.add(new OutcomeRelation(source, target, type, explanation));
        }
    }

    /**
     * Sets task relation according to the specified type.
     *
     * @param sourceDesc name of source decision or task
     * @param targetDesc name of target decision or task
     * @param dir        direction of relationship
     */
    public void setTaskRelation(String sourceDesc, String targetDesc, String dir) {
        int source = 0;
        int target = 0;
        Task sourceTask;
        Task targetTask;
        Decision sourceDecision;
        Decision targetDecision;

        // depending on direction different relation has to be set.
        switch (dir) {
            case "oneWay":
                sourceTask = getTask(sourceDesc);
                if (sourceTask != null) {
                    source = sourceTask.getId();
                }
                targetDecision = getDecision(targetDesc);
                if (targetDecision != null) {
                    target = targetDecision.getId();
                }
                dir = "auto";
                break;
            case "twoWay":
                sourceTask = getTask(sourceDesc);
                if (sourceTask != null) {
                    source = sourceTask.getId();
                }
                targetDecision = getDecision(targetDesc);
                if (targetDecision != null) {
                    target = targetDecision.getId();
                }
                dir = "both";
                break;
            // switch of source and target
            case "backwards":
                sourceDecision = getDecision(targetDesc);
                if (sourceDecision != null) {
                    source = sourceDecision.getId();
                }
                targetTask = getTask(sourceDesc);
                if (targetTask != null) {
                    target = targetTask.getId();
                }
                dir = "auto";
                break;
            // no default always has to have a specified direction
        }
        // add new task relation
        TaskRelation tr = new TaskRelation(source, target, dir);
        influencingTasks.add(tr);
    }

    /**
     * Retrieves decision point by name.
     *
     * @param decisionPointName name of desired decision point
     * @return decision point or null if decision point does not exist
     */
    public DecisionPoint getDecisionPoint(String decisionPointName) {
        for (DecisionPoint decisionPoint : decisionPoints) {
            if (decisionPoint.getLabel().equals(decisionPointName)) {
                return decisionPoint;
            }
        }
        return null;
    }

    /**
     * Retrieves decision by name.
     *
     * @param decisionName name of desired decision
     * @return decision or null if decision does not exist
     */
    private Decision getDecision(String decisionName) {
        for (DecisionPoint dp : decisionPoints) {
            Decision dec = dp.getDecision(decisionName);
            if (dec != null) {
                return dec;
            }
        }
        return null;
    }

    /**
     * Retrieves decision by id.
     *
     * @param decisionId name of desired decision
     * @return decision or null if decision does not exist
     */
    private Decision getDecision(int decisionId) {
        for (DecisionPoint dp : decisionPoints) {
            Decision dec = dp.getDecision(decisionId);
            if (dec != null) {
                return dec;
            }
        }
        return null;
    }

    /**
     * Retrieves Outcome by name.
     *
     * @param outcomeName name of desired outcome
     * @return outcome or null if outcome does not exist
     */
    private Outcome getOutcome(String outcomeName) {
        for (DecisionPoint dp : decisionPoints) {
            for (Decision d : dp.getDecisions()) {
                Outcome out = d.getOutcome(outcomeName);
                if (out != null) {
                    return out;
                }
            }
        }
        return null;
    }

    /**
     * Retrieves Outcome by id.
     *
     * @param outcomeId name of desired outcome
     * @return outcome or null if outcome does not exist
     */
    private Outcome getOutcome(int outcomeId) {
        for (DecisionPoint dp : decisionPoints) {
            for (Decision d : dp.getDecisions()) {
                Outcome out = d.getOutcome(outcomeId);
                if (out != null) {
                    return out;
                }
            }
        }
        return null;
    }

    /**
     * Retrieves task by name.
     *
     * @param taskName name of desired task
     * @return task or null if task does not exist
     */
    private Task getTask(String taskName) {
        for (Task t : tasks) {
            if (t.getLabel().equals(taskName)) {
                return t;
            }
        }
        return null;
    }

    /**
     * Sort of all relations to produce sorted output in id ascending order of the source.
     */
    public void sortLists() {
        RelationComparator rc = new RelationComparator();
        Collections.sort(influencingDecisions, rc);
        Collections.sort(influencingOutcomes, rc);
        Collections.sort(influencingTasks, rc);
    }

    /**
     * Sort of all entities of the CloudDSF to produce sorted output depending on id in ascending
     * order.
     */
    public void sortEntities() {
        CloudDSFEntityComparator cec = new CloudDSFEntityComparator();
        Collections.sort(decisionPoints, cec);
        Collections.sort(tasks, cec);
        for (DecisionPoint dp : decisionPoints) {
            dp.getDecisions().forEach(Decision::sortOutcomes);
            dp.sortDecisions();
        }
    }

    /**
     * Sorts influencing Relations.
     */
    private void sortInfluencingRelations() {
        Collections.sort(influencingRelations, new RelationComparator());
    }

    public void addDecisionPoint(DecisionPoint dp) {
        decisionPoints.add(dp);
    }

    public void addTask(Task task) {
        tasks.add(task);
    }

    @JsonIgnore
    public List<TaskRelation> getInfluencingTasks() {
        return influencingTasks;
    }

    @JsonIgnore
    public List<OutcomeRelation> getInfluencingOutcomes() {
        return influencingOutcomes;
    }

    @JsonProperty("children")
    public List<DecisionPoint> getDecisionPoints() {
        return decisionPoints;
    }

    @JsonIgnore
    public List<DecisionRelation> getInfluencingDecisions() {
        return influencingDecisions;
    }

    @JsonIgnore
    public List<Task> getTasks() {
        return tasks;
    }

    @JsonIgnore
    public List<Relation> getInfluencingRelations() {
        return influencingRelations;
    }

    /**
     * Adds all relations from the task, decision and outcome list to the relations list for CloudDSF.
     */
    public void setInfluencingRelations() {
        influencingRelations.clear();
        influencingRelations.addAll(influencingDecisions);
        influencingRelations.addAll(influencingTasks);
        influencingRelations.addAll(influencingOutcomes);
        sortInfluencingRelations();
    }

    /**
     * Helper Method to print out content of cloudDSF Object to check content.
     */
    @SuppressWarnings("ConstantConditions")
    public void printCloudDSF() {

        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("printCloudDSF");
        System.out.println("--------------------------------------------------------------------------------");

        // counter for entities
        int dpamount = 0;
        int damount = 0;
        int oamount = 0;
        int tamount = 0;

        // counter for relations
        int decRelations = 0;
        int taskRelations = 0;
        int outRelationsAmount = 0;

        int inRelations;
        int exRelations;
        int allRelations;
        int condAllRelations;
        int allPlusRelations;
        int arbAllRelations;
        int dpInRelations;
        int dpExRelations;
        int dpAllRelations;
        int dpCondAllRelations;
        int dpAllPlusRelations;
        int dpArbAllRelations;

        int dReqRelations;
        int dInfRelations;
        int dAffRelations;
        int dBinRelations;
        int dpDecReqRelations;
        int dpDecInfRelations;
        int dpDecAffRelations;
        int dpDecBinRelations;

        for (DecisionPoint dp : getDecisionPoints()) {
            // counter for relations per decision point
            dpAllRelations = 0;
            dpInRelations = 0;
            dpExRelations = 0;
            dpCondAllRelations = 0;
            dpAllPlusRelations = 0;
            dpArbAllRelations = 0;

            dpDecReqRelations = 0;
            dpDecInfRelations = 0;
            dpDecAffRelations = 0;
            dpDecBinRelations = 0;

            dpamount++;
            System.out.println("Decision Point Name = " + dp.getLabel() + " ID " + dp.getId());
            for (Decision d : dp.getDecisions()) {
                // counter for relations per decision
                inRelations = 0;
                exRelations = 0;
                allRelations = 0;
                condAllRelations = 0;
                allPlusRelations = 0;
                arbAllRelations = 0;

                dReqRelations = 0;
                dInfRelations = 0;
                dAffRelations = 0;
                dBinRelations = 0;

                damount++;

                for (Outcome o : d.getOutcomes()) {
                    oamount++;
                    for (OutcomeRelation outRelation : influencingOutcomes) {
                        if (outRelation.getSource() == o.getId()) {
                            switch (outRelation.getType()) {
                                case OutcomeRelation.INCLUDING:
                                    inRelations++;
                                    dpInRelations++;
                                    break;
                                case OutcomeRelation.EXCLUDING:
                                    exRelations++;
                                    dpExRelations++;
                                    break;
                                case OutcomeRelation.ALLOWING:
                                    allRelations++;
                                    dpAllRelations++;
                                    break;
                                case OutcomeRelation.CONDITIONAL_ALLOWING:
                                    condAllRelations++;
                                    dpCondAllRelations++;
                                    break;
                                case OutcomeRelation.ALLOWING_PLUS:
                                    allPlusRelations++;
                                    dpAllPlusRelations++;
                                    break;
                                case OutcomeRelation.ARBITRARY_ALLOWING:
                                    arbAllRelations++;
                                    dpArbAllRelations++;
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }

                for (DecisionRelation decRelation : influencingDecisions) {
                    if (decRelation.getSource() == d.getId()) {
                        switch (decRelation.getType()) {
                            case DecisionRelation.INFLUENCING:
                                dInfRelations++;
                                dpDecInfRelations++;
                                break;
                            case DecisionRelation.BINDING:
                                dBinRelations++;
                                dpDecBinRelations++;
                                break;
                            case DecisionRelation.AFFECTING:
                                dAffRelations++;
                                dpDecAffRelations++;
                                break;
                            case DecisionRelation.REQUIRING:
                                dReqRelations++;
                                dpDecReqRelations++;
                                break;
                            default:
                                break;
                        }
                    }
                }

                System.out.println("Decision " + d.getLabel() + " has:");
                System.out.println("Affecting: " + dAffRelations);
                System.out.println("Binding: " + dBinRelations);
                System.out.println("Influencing: " + dInfRelations);
                System.out.println("Requiring: " + dReqRelations);
                System.out.println("#### Corresponding Outcome Relations ####");

                System.out.println("Including (in): " + inRelations);
                System.out.println("Excluding (ex): " + exRelations);
                System.out.println("Allowing (a): " + allRelations);
                System.out.println("Conditional Allowing (ca): " + condAllRelations);
                System.out.println("Allowing Plus (ap): " + allPlusRelations);
                System.out.println("Arbitrary Allowing (aa): " + arbAllRelations);
            }

            System.out.println("Decision Point " + dp.getLabel() + " has:");
            System.out.println("Affecting: " + dpDecAffRelations);
            System.out.println("Binding: " + dpDecBinRelations);
            System.out.println("Influencing: " + dpDecInfRelations);
            System.out.println("Requiring: " + dpDecReqRelations);

            System.out.println("#### Corresponding Outcome Relations ####");

            System.out.println("Including (in): " + dpInRelations);
            System.out.println("Excluding (ex): " + dpExRelations);
            System.out.println("Allowing (a): " + dpAllRelations);
            System.out.println("Conditional Allowing (ca): " + dpCondAllRelations);
            System.out.println("Allowing Plus (ap): " + dpAllPlusRelations);
            System.out.println("Arbitrary Allowing (aa): " + dpArbAllRelations);
        }

        for (Task t : tasks) {
            System.out.println("Task " + t.getLabel() + " " + t.getId());
            tamount++;
        }

        for (DecisionRelation decRelation : influencingDecisions) {
            System.out.println("Decision Relationship from " + decRelation.getSource() + " to "
                    + decRelation.getTarget() + " with 'type' ");
            decRelations++;
        }

        allRelations = 0;
        inRelations = 0;
        exRelations = 0;
        condAllRelations = 0;
        allPlusRelations = 0;
        arbAllRelations = 0;

        for (OutcomeRelation outRelation : influencingOutcomes) {
            switch (outRelation.getType()) {
                case OutcomeRelation.INCLUDING:
                    inRelations++;
                    break;
                case OutcomeRelation.EXCLUDING:
                    exRelations++;
                    break;
                case OutcomeRelation.ALLOWING:
                    allRelations++;
                    break;
                case OutcomeRelation.CONDITIONAL_ALLOWING:
                    condAllRelations++;
                    break;
                case OutcomeRelation.ALLOWING_PLUS:
                    allPlusRelations++;
                    break;
                case OutcomeRelation.ARBITRARY_ALLOWING:
                    arbAllRelations++;
                    break;
                default:
                    break;
            }

            outRelationsAmount++;
        }

        System.out.println("Total outcome Relations:");
        System.out.println("- " + inRelations + " including (in) relations");
        System.out.println("- " + exRelations + " excluding (ex) relations");
        System.out.println("- " + allRelations + " allowing (a) relations");
        System.out.println("- " + condAllRelations + " conditional allowing (ca) relations");
        System.out.println("- " + allPlusRelations + " allowing plus (ap) relations");
        System.out.println("- " + arbAllRelations + " arbitrary allowing (aa) relations");

        for (TaskRelation taskRelation : influencingTasks) {
            System.out.println("Task Relationship from " + taskRelation.getSource() + " to "
                    + taskRelation.getTarget() + " with type " + taskRelation.getDir());
            taskRelations++;
        }
        System.out.println("##################################");
        System.out.println("#Decision Points = " + dpamount);
        System.out.println("#Decision = " + damount);
        System.out.println("#Number Outcomes = " + oamount);
        System.out.println("#Number Tasks = " + tamount);
        System.out.println("#Relations between Decisions = " + decRelations);
        System.out.println("#Relations between Outcomes = " + outRelationsAmount);
        System.out.println("#Relations between Tasks and Decision = " + taskRelations);
    }

    /**
     * Executes all verification methods and returns the result.
     *
     * @return true if all checks are successful otherwise false
     */
    public boolean checkSanity() {
        //LOG
        System.out.println("checkSanity");
        System.out.println("####################");
        //LOG

        // RULE #9: including (in) requires including (in) or allowing (a) in reverse case
        ArrayList<String> inOutRelRevTypes = new ArrayList<>();
        inOutRelRevTypes.add(OutcomeRelation.INCLUDING);
        inOutRelRevTypes.add(OutcomeRelation.ALLOWING);

        // now we want to have all error message
        return checkRelTypesDecisions()
                & checkRelTypesOutcomes()
                & checkDecRelComb()
                & checkOutRelAmountForDecRel()
                & checkDecRelForOutRel()
                & checkAffBinDecRelations(DecisionRelation.AFFECTING, DecisionRelation.BINDING)
                & checkAffBinDecRelations(DecisionRelation.BINDING, DecisionRelation.AFFECTING)
                & checkInAOutRelations(OutcomeRelation.INCLUDING, inOutRelRevTypes)
                & checkInAOutRelations(OutcomeRelation.EXCLUDING, null)
                & checkInAOutRelations(OutcomeRelation.ALLOWING, null)
                & checkInAOutRelations(OutcomeRelation.CONDITIONAL_ALLOWING, null)
                & checkInAOutRelations(OutcomeRelation.ALLOWING_PLUS, null)
                & checkInAOutRelations(OutcomeRelation.ARBITRARY_ALLOWING, null)
                & checkSingleOutcomeRel()
                & checkXOROutcomes();
    }

    /**
     * Checks if only valid decision relationship types are present.
     * <p>
     * RULE #1: On the level of decisions, only
     * - binding,
     * - affecting,
     * - influencing,
     * - requiring
     * relationship types are allowed.
     *
     * @return true if check successful otherwise false
     */
    boolean checkRelTypesDecisions() {
        for (DecisionRelation decRel : influencingDecisions) {
            switch (decRel.getType()) {
                case DecisionRelation.INFLUENCING:
                    break;
                case DecisionRelation.AFFECTING:
                    break;
                case DecisionRelation.BINDING:
                    break;
                case DecisionRelation.REQUIRING:
                    break;
                default:
                    System.out.println("RULE #1 / checkRelTypesDecisions(): [Failed] Wrong decision relation type " + decRel.getType()
                            + " found from " + decRel.getSource() + " to " + decRel.getTarget());
                    return false;
            }
        }
        System.out.println("RULE #1 / checkRelTypesDecisions(): [Successful] All decision relationship types are valid");
        return true;
    }

    /**
     * Checks if only valid outcome relationship types are present.
     * <p>
     * RULE #2: On the level of outcomes, only
     * - including (in),
     * - excluding (ex),
     * - allowing (a),
     * - conditional allowing (ca),
     * - allowing plus (ap),
     * - arbitrary allowing (aa)
     * relationship types are allowed.
     *
     * @return true if check successful otherwise false
     */
    boolean checkRelTypesOutcomes() {
        for (OutcomeRelation outRel : influencingOutcomes) {
            switch (outRel.getType()) {
                case OutcomeRelation.INCLUDING:
                    break;
                case OutcomeRelation.EXCLUDING:
                    break;
                case OutcomeRelation.ALLOWING:
                    break;
                case OutcomeRelation.CONDITIONAL_ALLOWING:
                    break;
                case OutcomeRelation.ALLOWING_PLUS:
                    break;
                case OutcomeRelation.ARBITRARY_ALLOWING:
                    break;
                default:
                    System.out.println("RULE #2 / checkRelTypesOutcomes(): [Failed] Wrong outcome relation type " + outRel.getType()
                            + " found from " + outRel.getSource() + " to " + outRel.getTarget());
                    return false;
            }
        }
        System.out.println("RULE #2 / checkRelTypesOutcomes(): [Successful] All outcome relationship types are valid");
        return true;
    }

    /**
     * Checks if two or more relations between the same decisions exists and if so if they are in the
     * correct combinations.
     * <p>
     * RULE #3: On the level of decisions only requiring relations can be combined with other
     * relationship types. Therefore, influencing, allowing and binding relationships
     * cannot coexist from one decision to another.
     *
     * @return true if check successful otherwise false
     */
    boolean checkDecRelComb() {
        boolean succeeded = true;
        for (DecisionRelation decRel : influencingDecisions) {
            // type of first decisions
            String relType = decRel.getType();
            for (DecisionRelation decRelComp : influencingDecisions) {
                if (decRelComp.getSource() == decRel.getSource() &&
                        decRelComp.getTarget() == decRel.getTarget()) {
                    // another relation exists between the same two decisions
                    String relTypeComp = decRelComp.getType();
                    // both relations have the same type thus it is the same
                    // relations (or a duplicate)
                    if (!relType.equals(relTypeComp)) {
                        // initial relation is requiring and compared relations
                        // is one of the other
                        if (relType.equals(DecisionRelation.REQUIRING)
                                && (relTypeComp.equals(DecisionRelation.INFLUENCING) || relTypeComp.equals(DecisionRelation.AFFECTING) || relTypeComp
                                .equals(DecisionRelation.BINDING))) {
                            succeeded = true;
                        }
                        // compared relationship is requiring and the initial
                        // rel is one of the other types
                        else if (relTypeComp.equals(DecisionRelation.REQUIRING)
                                && (relType.equals(DecisionRelation.INFLUENCING) || relType.equals(DecisionRelation.AFFECTING) || relType
                                .equals(DecisionRelation.BINDING))) {
                            succeeded = true;
                        }
                        // both relations are not requiring and thus an error
                        // exists
                        else {
                            System.out.println("-ERROR- Wrong decision relation combination between "
                                    + decRel.getSource() + " to " + decRel.getTarget() + " with relation type "
                                    + relType + " and " + relTypeComp);
                            succeeded = false;
                        }
                    }
                }
                // otherwise relation is not between same decisions and is skipped
            }
        }

        if (!succeeded) {
            System.out
                    .println("RULE #3 / checkDecRelComb(): [Failed] There are wrong decision relation combinations");
            return false;
        } else {
            System.out
                    .println("RULE #3 / checkDecRelComb(): [Successful] All decision relations are only existing in the only valid combination (requiring + any other)");
            return true;
        }
    }

    /**
     * Checks if the exact amount of relations are present for a decision relation.
     * <p>
     * RULE #4: If a relation from decision A to decision B exists, there must also be relationships
     * from any outcome of decision A to any of the outcomes of decision B.
     *
     * @return true if check successful otherwise false
     */
    boolean checkOutRelAmountForDecRel() {
        boolean succeeded = true;

        System.out.println("BEGIN: RULE #4 / checkOutRelAmountForDecRel()");

        for (DecisionRelation decRel : influencingDecisions) {
            if (!decRel.getType().equals(DecisionRelation.REQUIRING)) {
                // set source and target outcome to check
                Decision sourceDecision = getDecision(decRel.getSource());
                Decision targetDecision = getDecision(decRel.getTarget());

                int foundRelations =
                        (sourceDecision != null ? sourceDecision.getOutcomes().size() : 0) * (targetDecision != null ? targetDecision.getOutcomes().size() : 0);

                if (sourceDecision != null && targetDecision != null) {
                    System.out.println("RULE #4 / checkOutRelAmountForDecRel(): Decision relation "
                            + "[Source: id = " + sourceDecision.getId() + ", label = " + sourceDecision.getLabel() + ", outcomes = " + sourceDecision.getOutcomes().size() + "] <--> "
                            + "[Target: id = " + targetDecision.getId() + ", label = " + targetDecision.getLabel() + ", outcomes = " + targetDecision.getOutcomes().size() + "]");

                    // traverse starting outcomes
                    for (Outcome outSource : sourceDecision.getOutcomes()) {
                        System.out.println("--> startOutcome = [id: " + outSource.getId() + ", label: " + outSource.getLabel() + "]");

                        // traverse target outcomes
                        for (Outcome outTarget : targetDecision.getOutcomes()) {
                            System.out.println("--> endOutcome = [id: " + outTarget.getId() + ", label: " + outTarget.getLabel() + "]");

                            boolean relationExists = false;

                            // traverse outcomeRelations
                            for (OutcomeRelation outRel : influencingOutcomes) {
                                // if source and target are found than a corresponding relation exists
                                if (outSource.getId() == outRel.getSource()
                                        && outTarget.getId() == outRel.getTarget()) {
                                    foundRelations--;
                                    relationExists = true;
                                }
                            }

                            if (!relationExists) {
                                System.out.println("-ERROR- relation does not exist");
                            }
                        }
                    }
                }

                if (foundRelations != 0) {
                    succeeded = false;
                    System.out.println("-ERROR- There are " + foundRelations + " missing outcome relations");
                }
            }
        }

        if (succeeded) {
            System.out
                    .println("RULE #4 / checkOutRelAmountForDecRel(): [Successful] There are the exactly necessary amount of relations between outcomes per decision relation");
            return true;
        } else {
            System.out
                    .println("RULE #4 / checkOutRelAmountForDecRel(): [Failed] There are missing outcome relations");
            return false;
        }
    }

    /**
     * Checks for every outcome relation if the decisions have relationship as well.
     * <p>
     * RULE #5: If a relation from outcome A to outcome B exists, there must also be a relationship
     * from the respective decision of outcome A to the respective decision
     * of outcome B.
     *
     * @return true if check successful otherwise false
     */
    public boolean checkDecRelForOutRel() {
        boolean succeeded = true;
        // iterate over all outcome relations
        for (OutcomeRelation outRel : influencingOutcomes) {
            // get decision for outcome relation
            Decision decSource = null;
            Decision decTarget = null;

            Outcome outSource = getOutcome(outRel.getSource());
            if (outSource != null) {
                decSource = getDecision(outSource.getParent());
            }

            Outcome outTarget = getOutcome(outRel.getTarget());
            if (outTarget != null) {
                decTarget = getDecision(outTarget.getParent());
            }

            boolean found = false;
            // check decision relations if relationship exists
            for (DecisionRelation decRel : influencingDecisions) {
                if ((decSource != null ? decSource.getId() : 0) == decRel.getSource() && (decTarget != null ? decTarget.getId() : 0) == decRel.getTarget()) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                if (outSource != null && outTarget != null) {
                    System.out.println("-ERROR- no relation between decisions for an outcome relation was found"
                            + " [Source: id = " + outSource.getId() + ", label = " + outSource.getLabel() + "] <-->"
                            + " [Target: id = " + outTarget.getId() + ", label = " + outTarget.getLabel() + "]");
                } else {
                    System.out.println("-ERROR- no relation between decisions for an outcome relation was found");
                }

                succeeded = false;
            }
        }

        if (!succeeded) {
            System.out.println("RULE #5 / checkDecRelForOutRel(): [Failed] There is no relation between source and target decisions of some outcomes");
            return false;
        } else {
            System.out.println("RULE #5 / checkDecRelForOutRel(): [Successful] All outcome relations are valid corresponding to the relationship between their source and target decisions");
            return true;
        }
    }

    /**
     * Checks in case an affecting relation exists into one direction that a binding exists into the
     * other way around and vice versa for decisions.
     * <p>
     * RULE #7: Binding and affecting relations are complimentary to each other. Logically, if a
     * binding relation from decision A towards decision B exists, in the reverse case,
     * an affecting relationship must be present and vice versa.
     *
     * @param type1 relationship type to check against (e.g. aff)
     * @param type2 second relationship type (e.g. eb)
     * @return true if check successful otherwise false
     */
    public boolean checkAffBinDecRelations(String type1, String type2) {
        int aff = 0;
        int bin = 0;
        for (DecisionRelation decRel : influencingDecisions) {
            // filter affecting relations only
            if (decRel.getType().equals(type1)) {
                aff++;
                for (DecisionRelation decRelComp : influencingDecisions) {
                    // find relation for reverse case
                    if (decRel.getSource() == decRelComp.getTarget()
                            && decRel.getTarget() == decRelComp.getSource()) {
                        if (decRelComp.getType().equals(type2)) {
                            bin++;
                            break;
                        }
                    }
                }
            }
        }
        if (aff != bin) {
            // unequal amount of binding and affecting relations for decisions
            System.out.println("RULE #7 / checkAffBinDecRelations(): [Failed] There are not the same amount of " + type1 + " to " + type2
                    + " decision relations");
            return false;
        } else {
            System.out.println("RULE #7 / checkAffBinDecRelations(): [Successful] There are the same amount of " + type1 + " to " + type2
                    + " decisions relations");
            return true;
        }
    }

    /**
     * Checks if in or a outcome relation from A to B has an in or a relation in the reverse case as
     * well.
     * <p>
     * RULE #9: If an including (in) relation from outcome A to outcome B exists, in the
     * case a relation exists in reverse, it must also be of the including (in) or allowing (a)
     * relationship type. Otherwise a contradiction would exist.
     * For all other relationship types:
     * - excluding (ex),
     * - allowing (a),
     * - conditional allowing (ca),
     * - allowing plus (ap),
     * - arbitrary allowing (aa)
     * the reverse relation must exist but can be of any type.
     *
     * @param outRelType first relationship type that others are compared with
     * @param allowedOutRelTypes relationship types that is allowed with outRelType
     * @return true if check successful otherwise false
     */
    public boolean checkInAOutRelations(String outRelType, List<String> allowedOutRelTypes) {
        boolean succeeded = true;
        for (OutcomeRelation outRel : influencingOutcomes) {
            if (outRel.getType().equals(outRelType)) {
                for (OutcomeRelation outRelComp : influencingOutcomes) {
                    // find relation for reverse case
                    if (outRel.getSource() == outRelComp.getTarget() &&
                            outRel.getTarget() == outRelComp.getSource()) {
                        // if allowedOutRelTypes == null: the reverse relation must exist but can be of any type
                        if (allowedOutRelTypes != null) {
                            if (allowedOutRelTypes.contains(outRelComp.getType())) {
                                break;
                            } else {
                                System.out
                                        .println("-ERROR- There is a conflict between two (vice versa) outcome relationship types"
                                                + " [outRel.getType() = " + outRel.getType()
                                                + ", outRelComp.getType() = " + outRelComp.getType() + "]");
                                succeeded = false;
                            }
                        }
                    }
                }
            }
        }

        if (!succeeded) {
            System.out
                    .println("RULE #9 / checkInAOutRelations(): [Failed] Some outcome relations have an ex to in/a relation combination in the reverse case");
            return false;
        } else {
            System.out
                    .println("RULE #9 / checkInAOutRelations(): [Successful] All outcome relations do not have an ex to in/a relation combination in the reverse case");
            return true;
        }
    }

    /**
     * Checks if an outcome has multiple relations towards another outcome.
     * <p>
     * RULE #10: Any given outcome can only have one relation towards another outcome.
     *
     * @return true if check successful otherwise false
     */
    public boolean checkSingleOutcomeRel() {
        // traverse all outcomes
        for (DecisionPoint decisionPoint : decisionPoints) {
            for (Decision decision : decisionPoint.getDecisions()) {
                for (Outcome outcome : decision.getOutcomes()) {
                    // set for target Ids
                    Set<Integer> uniqueTargets = new HashSet<>();
                    for (OutcomeRelation outRel : influencingOutcomes) {
                        if (outcome.getId() == outRel.getSource()) {
                            // if adding returns false value is already in set thus
                            // a target has been twice in the target list for the respective outcome.
                            if (!uniqueTargets.add(outRel.getTarget())) {
                                System.out
                                        .println("RULE #10 / checkSingleOutcomeRel(): [Failed] One outcome has several relations towards another outcome");
                                return false;
                            }
                        }
                    }
                }
            }
        }
        System.out.println("RULE #10 / checkSingleOutcomeRel(): [Successful] All outcomes have only one relation towards other outcomes");
        return true;
    }

    /**
     * Checks if outcomes have a relation to themselves or towards outcomes of the same decision.
     * <p>
     * RULE #11: Between outcomes of the same decision an exclusive or relation were specified.
     * Hence, as soon as an outcome is selected all others of the respective decision
     * are not applicable anymore. Therefore, defined relations between outcomes of
     * the same decision never apply and would unnecessarily pollute the knowledge
     * base. As a consequence, any given outcome is only allowed to have relations
     * towards outcomes of other decisions.
     *
     * @return true if check successful otherwise false
     */
    public boolean checkXOROutcomes() {
        // iterate all outcomes
        for (DecisionPoint decisionPoint : decisionPoints) {
            for (Decision decision : decisionPoint.getDecisions()) {
                for (Outcome outcome : decision.getOutcomes()) {
                    // iterate over outcome relations for each outcome
                    for (OutcomeRelation outRel : influencingOutcomes) {
                        if (outcome.getId() == outRel.getSource()) {
                            if (outcome.getId() == outRel.getTarget()) {
                                // if target and source are equal
                                System.out.println("RULE #11 / checkXOROutcomes(): [Failed] Outcome has a relation to itself");
                                return false;
                            } else {
                                Outcome outRelTarget = getOutcome(outRel.getTarget());
                                if (outRelTarget != null) {
                                    if (outcome.getParent() == outRelTarget.getParent()) {
                                        // parental decision of both outcomes are similar
                                        System.out.println("RULE #11 / checkXOROutcomes(): [Failed] Outcome has relations towards outcome of same decision");
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        System.out.println("RULE #11 / checkXOROutcomes(): [Successful] All outcomes satisfy the XOR rule");
        return true;
    }

}
