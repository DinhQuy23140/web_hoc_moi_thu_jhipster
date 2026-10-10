package com.lingora.service.util;

import java.util.ArrayList;
import java.util.List;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/** Small helpers around Jackson trees; JSON columns are stored as text. */
public final class Json {

    public static final JsonMapper MAPPER = JsonMapper.builder().build();

    private Json() {}

    public static ObjectNode obj() {
        return MAPPER.createObjectNode();
    }

    public static ArrayNode arr() {
        return MAPPER.createArrayNode();
    }

    public static JsonNode read(String text) {
        return text == null || text.isEmpty() ? null : MAPPER.readTree(text);
    }

    public static String write(JsonNode node) {
        return isAbsent(node) ? null : MAPPER.writeValueAsString(node);
    }

    public static boolean isAbsent(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode();
    }

    /** Serialized sub-tree of {@code field}, or null. */
    public static String raw(JsonNode node, String field) {
        return node == null ? null : write(node.get(field));
    }

    public static String str(JsonNode node, String field) {
        if (node == null) return null;
        JsonNode v = node.get(field);
        if (isAbsent(v)) return null;
        String s = v.isValueNode() ? v.asString() : write(v);
        return s == null || s.isEmpty() ? null : s;
    }

    public static String str(JsonNode node, String field, int maxLength) {
        String s = str(node, field);
        return s == null || s.length() <= maxLength ? s : s.substring(0, maxLength);
    }

    public static int integer(JsonNode node, String field, int def) {
        if (node == null) return def;
        JsonNode v = node.get(field);
        if (isAbsent(v)) return def;
        return v.isNumber() ? (int) Math.round(v.asDouble()) : v.asInt(def);
    }

    public static Integer integerOrNull(JsonNode node, String field) {
        if (node == null) return null;
        JsonNode v = node.get(field);
        return isAbsent(v) ? null : integer(node, field, 0);
    }

    public static double number(JsonNode node, String field, double def) {
        if (node == null) return def;
        JsonNode v = node.get(field);
        return isAbsent(v) ? def : v.asDouble(def);
    }

    public static boolean bool(JsonNode node, String field, boolean def) {
        if (node == null) return def;
        JsonNode v = node.get(field);
        return isAbsent(v) ? def : v.asBoolean(def);
    }

    public static Boolean boolOrNull(JsonNode node, String field) {
        if (node == null) return null;
        JsonNode v = node.get(field);
        return isAbsent(v) ? null : v.asBoolean(false);
    }

    public static List<String> strings(JsonNode node, String field) {
        List<String> out = new ArrayList<>();
        JsonNode v = node == null ? null : node.get(field);
        if (v != null && v.isArray()) {
            for (JsonNode x : v) {
                if (!isAbsent(x)) out.add(x.asString());
            }
        }
        return out;
    }

    public static void put(ObjectNode o, String field, String value) {
        if (value != null) o.put(field, value);
    }

    public static void put(ObjectNode o, String field, Integer value) {
        if (value != null) o.put(field, value);
    }

    public static void put(ObjectNode o, String field, Boolean value) {
        if (value != null) o.put(field, value);
    }

    /** Puts a JSON column (text) as a tree. */
    public static void putRaw(ObjectNode o, String field, String json) {
        JsonNode n = read(json);
        if (n != null) o.set(field, n);
    }
}
