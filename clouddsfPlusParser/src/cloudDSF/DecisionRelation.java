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
 * Represents a relation between two decisions in the cloudDSF(Plus).
 *
 * @author Metz
 */
public class DecisionRelation extends Relation {
    public static final String INFLUENCING = "influencing";
    public static final String AFFECTING = "affecting";
    public static final String BINDING = "binding";
    public static final String REQUIRING = "requiring";

    /**
     * Decision relation constructor for cloudDSFPlus.
     *
     * @param source id of source decision
     * @param target id of target decision
     * @param type   relationship type
     */
    DecisionRelation(int source, int target, String type) {
        super(source, target, type.toLowerCase());
        this.setRelationGroup("decRel");
    }

    /**
     * Decision relation constructor for cloudDSF.
     *
     * @param source id of source decision
     * @param target id of target decision
     */
    DecisionRelation(int source, int target) {
        super(source, target, "DecRel");
        this.setDir("auto");
    }
}
