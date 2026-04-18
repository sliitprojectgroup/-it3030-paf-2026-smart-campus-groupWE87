package com.sliit.paf.service;

import com.sliit.paf.exception.ResourceNotFoundException;
import com.sliit.paf.model.Resource;
import com.sliit.paf.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource resourceDetails) {
        Resource resource = getResourceById(id);
        resource.setName(resourceDetails.getName());
        resource.setType(resourceDetails.getType());
        resource.setCapacity(resourceDetails.getCapacity());
        resource.setStatus(resourceDetails.getStatus());
        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }
}
