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

/**
 * Represents relation between two outcomes for the cloudDSFPlus.
 *
 * @author Metz
 */
public class OutcomeRelation extends Relation {
    public static final String INCLUDING = "in";
    public static final String EXCLUDING = "ex";
    public static final String ALLOWING = "a";
    public static final String CONDITIONAL_ALLOWING = "ca";
    public static final String ALLOWING_PLUS = "ap";
    public static final String ARBITRARY_ALLOWING = "aa";

    public OutcomeRelation(int source, int target, String type, String explanation) {
        super(source, target, type, explanation);
        this.setRelationGroup("outRel");
    }

    /**
     * Constructor for an outcome relation.
     *
     * @param source id of source outcome
     * @param target id of target outcome
     * @param type   relationship type
     */
    public OutcomeRelation(int source, int target, String type) {
        super(source, target, type);
        this.setRelationGroup("outRel");
    }

    public static boolean verifyType(String type) {
        return type.equals(OutcomeRelation.INCLUDING) ||
                type.equals(OutcomeRelation.EXCLUDING) ||
                type.equals(OutcomeRelation.ALLOWING) ||
                type.equals(OutcomeRelation.CONDITIONAL_ALLOWING) ||
                type.equals(OutcomeRelation.ALLOWING_PLUS) ||
                type.equals(OutcomeRelation.ARBITRARY_ALLOWING);
    }
}
