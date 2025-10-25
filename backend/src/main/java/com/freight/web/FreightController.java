package com.freight.web;

import com.freight.model.Freight;
import com.freight.repo.FreightRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/freights")
@CrossOrigin(origins = {"http://localhost:5173"}, allowCredentials = "true")
public class FreightController {

    private final FreightRepository repo;

    public FreightController(FreightRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public Freight create(@Valid @RequestBody Freight f) {
        return repo.save(f);
    }

    @GetMapping("{id}")
    public Freight get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PutMapping("{id}")
    public Freight update(@PathVariable Long id, @RequestBody Map<String, Object> in) {
        Freight f = repo.findById(id).orElseThrow();
        if (in.containsKey("status")) {
            f.setStatus((String) in.get("status"));
        }
        if (in.containsKey("attributes")) {
            f.setAttributes((Map<String, Object>) in.get("attributes"));
        }
        return repo.save(f);
    }

    @DeleteMapping("{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }

    // GET /api/freights?q=texto&page=0&size=10
    @GetMapping
    public Page<Freight> list(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return repo.search(
                q,
                PageRequest.of(page, size, Sort.by("id").descending())
        );
    }
}